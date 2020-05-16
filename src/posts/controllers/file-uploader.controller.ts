import {Controller, Post, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {JwtAuthGuard} from "../../auth/jwt-auth.guard";
import {diskStorage} from "multer";
import {dirname, join, extname} from "path";
import * as moment from "moment";

const mkdirp = require('mkdirp');

@Controller("file-upload")
export class FileUploaderController {
    @UseGuards(JwtAuthGuard)
    @Post()
    @UseInterceptors(
        FileInterceptor(
            'file',
            {
                storage: diskStorage({
                    destination: function (req, file, cb) {
                        let saveDir = join(dirname(require.main.filename), "..", "uploads/files/" + moment().format("YYYY/MM/DD"));
                        mkdirp(saveDir, null).then(
                            () => {
                                cb(null, saveDir)
                            }
                        );
                    },
                    filename: function (req, file, cb) {
                        const uniqueSuffix = Date.now();
                        const exception = extname(file.originalname);
                        cb(null, `${file.fieldname}-${uniqueSuffix}${exception}`)
                    }
                })
            }
        )
    )
    uploadFile(@UploadedFile() file) {
        return {
            uploadedFilePath: file.path.replace(join(dirname(require.main.filename), '../uploads'), '')
        };
    }
}