import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRECT // Click 'View API Keys' above to copy your API secret
});



const uploadOnCloudinary = async(localPath)=>{
    // console.log(localPath);
    
    try{
        if(!localPath) return null;
        //upload the file
        const response = await cloudinary.uploader.upload(localPath,{resource_type:"auto"})
        fs.unlinkSync(localPath)
        // console.log(response);
        return response
    }catch(err){
        console.log(err);
        
        fs.unlinkSync(localPath)
        return null
    }
}
    
export {uploadOnCloudinary}