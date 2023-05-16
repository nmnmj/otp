import otpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";

class Otpcont {
  static genotp = async (req, res) => {
    const { email } = req.body;
    try {
      const currentTime = Date.now();
      let otpRecord = await otpModel.findOne({ email });
      let user = await userModel.findOne({email})
      if(!user){
        user = await userModel.create({email})
      }
      const userTime = user.time.getTime();
      const timeDifference = currentTime - userTime;
      if(timeDifference > 3600000){   //3600000  for 1hr
        await userModel.findOneAndUpdate({ email }, { attempt: 0, time: currentTime, blocked: false });
      }

      if(user.blocked == false){
        if (otpRecord) {
          const otpTime = otpRecord.time.getTime();
          const timeDifference = currentTime - otpTime;
  
          if (timeDifference < 60000) { // Less than 1 minute has passed
            const remainingTime = Math.ceil((60000 - timeDifference) / 1000);
            return res.status(429).send({ "status": "error", "msg": `Please wait ${remainingTime} seconds before generating a new OTP.` });
          }
        }
  
        const otp = generateOTP(); // Function to generate a new OTP
  
        if (otpRecord) {
          await otpModel.findOneAndUpdate({ email }, { otp, time: currentTime });
          await userModel.findOneAndUpdate({ email }, { attempt: 0, time: currentTime });
        } else {
          otpRecord = await otpModel.create({ otp, email, time: currentTime });
          const r = await userModel.findOne({ email });
          if (!r) {
            await userModel.create({ email });
          }
        }
  
        
        setTimeout(async () => {
          const d = await otpModel.deleteOne({ _id: otpRecord._id });
          console.log("d", d);
        }, 300000); // Deleting the OTP record after 5 minutes (300000 milliseconds)
  
        res.send({ "status": "success", "msg": otp });

      }else{
        res.status(401).send({"status":"success", "msg":"Your account is temporarily blocked. Please try again after 1 hour."})
      }

    } catch (error) {
      res.status(500).send({ "status": "error", "msg": "Something went wrong." });
    }
  }
}

export default Otpcont;

function generateOTP() {
  let otp = "";
  for (let i = 0; i < 4; i++) {
    let n = Math.floor(Math.random() * 9) + 1;
    n = n.toString();
    otp += n;
  }
  return otp;
}

