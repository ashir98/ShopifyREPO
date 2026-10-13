import multer from "multer";


// file disk me save nhi hogi. RAM me aayegi phir Supabase pe bhejengy;
const storageConfig = multer.memoryStorage();



export const upload = multer({

    storage:  storageConfig, // ram me temprorary tor pe save hogi


    // file filteration
    fileFilter: (req,file,cb)=>{
        if (file.mimetype.startsWith("image/")) {
            cb(null,true)
        }
        else{
            cb("Only images are allowed", false);
        }
    },
    

    // file size limit
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})