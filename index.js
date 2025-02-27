import app from "./app.js";
import connectDb from "./db/index.js";
import dotenv from "dotenv"


//Configuring dotenv
dotenv.config(
    {
        path:"./.env"
    }
)

connectDb().then(
    app.listen(process.env.PORT,()=>{console.log(`Server is Running at port ${process.env.PORT}`);
    })
).catch((err)=>{
    console.log(err);

}
)