import {Connection} from "typeorm";

export class NestedSetsHelper {
    private connection: Connection;
    protected tableName;
    protected tablePkName = "id";

    protected tableParentColName = "parentId";
    protected tableRightColName = "nsright";
    protected tableLeftColName = "nsleft";

    constructor(data: any) {
        for (let i in data) {
            this[i] = data[i];
        }
    }

    async removeNodeByNodeID(nodeId) {
        let obj = await this.connection.query(`
            select
                ${this.tableLeftColName} as Lft,
                ${this.tableRightColName} as Rgt
            from
                ${this.tableName}
            where ${this.tablePkName} = ?
        `, [nodeId]);
        if (obj.length) {
            let {Lft, Rgt} = obj[0];
            await this.connection.query(`
                delete from
                    ${this.tableName}
                where
                    ${this.tableRightColName} <= ${Rgt} and ${this.tableLeftColName} >= ${Lft}
                order by 
                    ${this.tableLeftColName} desc
            `);
            await this.connection.query(`
                update 
                    ${this.tableName}
                set
                    ${this.tableLeftColName} = if(
                        ${this.tableLeftColName} > ${Rgt}, 
                        ${this.tableLeftColName} -1 - ${Rgt} + ${Lft},
                        ${this.tableLeftColName}
                    ),
                    ${this.tableRightColName} = if(
                        ${this.tableRightColName} > ${Rgt},
                        ${this.tableRightColName} -1 - ${Rgt} + ${Lft},
                        ${this.tableRightColName}
                    )
                where ${this.tableRightColName} >= ${Rgt};
            `)
        }
    }

    async hasPrevSibling(nodeId: number): Promise<boolean> {
        return await this.getPrevSiblingNodId(nodeId) !== null;
    }

    async hasNextSibling(nodeId: number): Promise<boolean> {
        return await this.getNextSiblingNodeId(nodeId) !== null;
    }

    async getPrevSiblingNodId(nodeId: number): Promise<number> {
         let query = `select psb.${this.tablePkName} from ${this.tableName} p 
            inner join ${this.tableName} psb on psb.${this.tableRightColName} = p.${this.tableLeftColName} - 1 where p.${this.tablePkName}=?`;
         let res = await this.connection.query(query, [nodeId]);
         return res.length ? res[0][this.tablePkName] : null;
    }

    async getNextSiblingNodeId(nodeId: number) {
        let query = `select psa.${this.tablePkName} from ${this.tableName} p 
            inner join ${this.tableName} psa on psa.${this.tableLeftColName}=p.${this.tableRightColName} + 1 where p.${this.tablePkName}=?`;
        let res = await this.connection.query(query, [nodeId]);
        return res.length ? res[0][this.tablePkName] : null;
    }

    async moveNodeOneStepBackward(nodeId) {
        if (!await this.hasPrevSibling(nodeId)) {
            let res = await this.connection.query(`select ${this.tableParentColName} from ${this.tableName} p where p.${this.tablePkName}=?`, [nodeId]);
            if (res.length && res[0][this.tableParentColName]) {
                await this.moveNodeBeforeNodeID(nodeId, res[0][this.tableParentColName]);
            }
        } else {
            let query = `
                select
                    p.${this.tablePkName} as A_NodeID,
                    p.${this.tableLeftColName} as A_NodeLft,
                    p.${this.tableRightColName} as A_NodeRgt,
                    p.${this.tableRightColName} - p.${this.tableLeftColName} + 1 as A_Distance,
                    psb.${this.tableLeftColName} as B_NodeLft,
                    psb.${this.tableRightColName} as B_NodeRgt,
                    psb.${this.tableRightColName} - psb.${this.tableLeftColName} + 1 as B_Distance
                from
                    ${this.tableName} p
                inner join
                    ${this.tableName} psb on psb.${this.tableRightColName} = p.${this.tableLeftColName} - 1
                where
                    p.${this.tablePkName}=? 
            `;
            let obj = await this.connection.query(query, [nodeId]);
            let {A_NodeID, A_NodeLft, A_NodeRgt, A_Distance, B_NodeLft, B_NodeRgt, B_Distance} = obj[0];
            let nodesToUpdateIds = (await this.connection.query(
                `select ${this.tablePkName} from ${this.tableName} where ${this.tableLeftColName} >= ? and ${this.tableRightColName} <= ?`,
                [B_NodeLft, B_NodeRgt]
            )).map(t => t[this.tablePkName]).join(",");

            query = `
                update ${this.tableName} set 
                    ${this.tableLeftColName} = ${this.tableLeftColName} - ${B_Distance},
                    ${this.tableRightColName} = ${this.tableRightColName} - ${B_Distance}
                where
                    ${this.tableLeftColName} >= ${A_NodeLft} and ${this.tableRightColName} <= ${A_NodeRgt}
             `;
            await this.connection.query(query);

            query = `
                update ${this.tableName} set
                    ${this.tableLeftColName} = ${this.tableLeftColName} + ${A_Distance},
                    ${this.tableRightColName} = ${this.tableRightColName} + ${A_Distance}
                where 
                    ${this.tableLeftColName} >= ${B_NodeLft} and ${this.tableRightColName} <= ${B_NodeRgt} 
                    and ${this.tablePkName} in (${nodesToUpdateIds})
             `;
            await this.connection.query(query)
        }
    }

    async moveNodeOneStepForward(nodeId) {
        let nextSiblingId = await this.getNextSiblingNodeId(nodeId);
        if (nextSiblingId) {
            await this.moveNodeOneStepBackward(nextSiblingId);
        } else {
            let res = await this.connection.query(`
                select 
                    t.${this.tableParentColName}, tp.${this.tableParentColName} as parentParentId
                from ${this.tableName} t
                left join ${this.tableName} tp on tp.${this.tablePkName} = t.${this.tableParentColName}
                where t.${this.tablePkName}=?`, nodeId);
            if (res.length && res[0][this.tableParentColName]) {
                let parentNext = await this.getNextSiblingNodeId(res[0][this.tableParentColName]);
                if (parentNext) {
                    await this.moveNodeBeforeNodeID(nodeId, parentNext);
                } else if (res[0].parentParentId) {
                    await this.moveNodeAsLastChildByParentNodeID(nodeId, res[0].parentParentId);
                }
            }
        }
    }

    async moveNodeBeforeNodeID(nodeId: number, referenceNodeId: number) {
        if (nodeId == referenceNodeId) {
            return;
        }

        let getNodeQuery = `
            select
                ${this.tableLeftColName} as NodeLft,
                ${this.tableRightColName} as NodeRgt,
                ${this.tableRightColName} - ${this.tableLeftColName} + 1 as NodeDist
            from
                ${this.tableName}
            where
                ${this.tablePkName} = ?
        `;
        let obj = await this.connection.query(getNodeQuery, [nodeId]);

        let {NodeLft, NodeRgt, NodeDist} = obj[0];

        let getReferenceNodeQuery = `
            select
                ${this.tableLeftColName} as RefNodeLft,
                ${this.tableParentColName} as RefNodeParentID,
                (${this.tableLeftColName} between ${NodeLft} and ${NodeRgt}) as IsChild,
                if(${NodeLft} < ${this.tableLeftColName}, ${NodeLft}, ${NodeLft} + ${NodeDist}) as MovedNodeLft
            from
                ${this.tableName}
            where
                ${this.tablePkName} = ?
        `;

        let res = await this.connection.query(getReferenceNodeQuery, [referenceNodeId]);

        let {RefNodeLft, RefNodeParentID, IsChild, MovedNodeLft} = res[0];
        if (IsChild) {
            throw "Node can't be moved";
        }

        let setDistanceQuery = `
            update
                ${this.tableName}
            set
                ${this.tableLeftColName} = if(
                    ${this.tableLeftColName} >= ${RefNodeLft},
                    ${this.tableLeftColName} + ${NodeDist},
                    ${this.tableLeftColName}
                ),
                ${this.tableRightColName} = if(
                    ${this.tableRightColName} >= ${RefNodeLft},
                    ${this.tableRightColName} + ${NodeDist},
                    ${this.tableRightColName}
                )
            where
                ${this.tableRightColName} >= ${RefNodeLft};
        `;
        await this.connection.query(setDistanceQuery);

        let moveNodeQuery = `
            update
                ${this.tableName}
            set
                ${this.tableLeftColName} = ${this.tableLeftColName} + ${RefNodeLft} - ${MovedNodeLft},
                ${this.tableRightColName} = ${this.tableRightColName} + ${RefNodeLft} - ${MovedNodeLft},
                ${this.tableParentColName} = if(
                    ${this.tablePkName} = ?, ${RefNodeParentID}, ${this.tableParentColName}
                )
            where
                ${this.tableLeftColName} >= ${MovedNodeLft} and ${this.tableRightColName} <= ${MovedNodeLft} + ${NodeDist} - 1;    
        `;

        await this.connection.query(moveNodeQuery, [nodeId]);

        let updateDistanceQuery = `
            update 
                ${this.tableName}
            set
                ${this.tableLeftColName}=if(
                    ${this.tableLeftColName} > ${MovedNodeLft},
                    ${this.tableLeftColName} - ${NodeDist},
                    ${this.tableLeftColName}
                ),
                ${this.tableRightColName}=if(
                    ${this.tableRightColName} > ${MovedNodeLft},
                    ${this.tableRightColName} - ${NodeDist},
                    ${this.tableRightColName}
                )
            where ${this.tableRightColName} > ${MovedNodeLft};
        `;

        await this.connection.query(updateDistanceQuery);
    }

    async moveNodeAsLastChildByParentNodeID(nodeId: number, parentNodeID: number) {
        if (nodeId == parentNodeID) {
            return;
        }

        let getNodeQuery = `
            select 
                ${this.tableLeftColName} as moveLft,
                ${this.tableRightColName} as moveRgt,
                ${this.tableRightColName} - ${this.tableLeftColName} + 1 as moveDistance
            from
                ${this.tableName}
            where
                ${this.tablePkName} = ?
        `;
        let obj = await this.connection.query(getNodeQuery, [nodeId]);

        let {moveLft, moveRgt, moveDistance} = obj[0];

        let getParentNodeQuery = `
            select
                ${this.tableRightColName} as parentRgt,
                (${this.tableLeftColName} between ${moveLft} and ${moveRgt}) as isChild
            from 
                ${this.tableName}
            where 
                ${this.tablePkName} = ?
        `;
        obj = await this.connection.query(getParentNodeQuery, [parentNodeID]);

        let {parentRgt, isChild} = obj[0];

        if (isChild) {
            throw "Can't move node";
        }

        let setDistanceQuery = `
            update
                ${this.tableName}
            set
                ${this.tableLeftColName}=if(
                    ${this.tableLeftColName} > ${parentRgt},
                    ${this.tableLeftColName} + ${moveDistance},
                    ${this.tableLeftColName}
                ),
                ${this.tableRightColName}=if(
                    ${this.tableRightColName} >= ${parentRgt},
                    ${this.tableRightColName} + ${moveDistance},
                    ${this.tableRightColName}
                )
            where
                ${this.tableRightColName} >= ${parentRgt}
        `;

        await this.connection.query(setDistanceQuery);

        obj = await this.connection.query(`
            select
                ${this.tableLeftColName} as moveLft,
                ${this.tableRightColName} as moveRgt,
                if(
                    ${parentRgt} >= ${this.tableLeftColName},
                    ${parentRgt} - ${this.tableLeftColName},
                    ${this.tableLeftColName} - ${parentRgt}
                ) as moveNewDistance,
                if(${parentRgt} >= ${this.tableLeftColName}, 1, 0) as moveNewDistanceOperator
            from
                ${this.tableName}
            where
                ${this.tablePkName} = ?
        `, [nodeId]);
        moveLft = obj[0].moveLft;
        moveRgt = obj[0].moveRgt;
        let moveNewDistance = obj[0].moveNewDistance;
        let moveNewDistanceOper = obj[0].moveNewDistanceOperator;

        let moveNodeQuery = `
            update
                ${this.tableName}
            set
                ${this.tableLeftColName} = if(
                    ${moveNewDistanceOper} = 1,
                    ${this.tableLeftColName} + ${moveNewDistance},
                    ${this.tableLeftColName} - ${moveNewDistance}
                ),
                ${this.tableRightColName} = if(
                    ${moveNewDistanceOper} = 1,
                    ${this.tableRightColName} + ${moveNewDistance},
                    ${this.tableRightColName} - ${moveNewDistance}
                ),
                ${this.tableParentColName}=if(
                    ${this.tablePkName}=?, ?, ${this.tableParentColName}
                )
            where
                ${this.tableRightColName} <= ${moveRgt} and ${this.tableLeftColName} >= ${moveLft};
        `;
        await this.connection.query(moveNodeQuery, [nodeId, parentNodeID]);

        let updateDistanceQuery = `
            update
                ${this.tableName}
            set
                ${this.tableLeftColName}=if(
                    ${this.tableLeftColName} > ${moveRgt},
                    ${this.tableLeftColName} - ${moveDistance},
                    ${this.tableLeftColName}
                ),
                ${this.tableRightColName}=if(
                    ${this.tableRightColName} >= ${moveRgt},
                    ${this.tableRightColName} - ${moveDistance},
                    ${this.tableRightColName}
                )
            where
                ${this.tableRightColName} >= ${moveRgt}
        `;
        await this.connection.query(updateDistanceQuery);
    }
}