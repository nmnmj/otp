import otpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";

class Otpcontroller {
  static lastCallTime = 0;

  static genotp = async (req, res) => {
    const currentTime = Date.now();
    const timeDifference = currentTime - Otpcontroller.lastCallTime;

    if (timeDifference < 60000) {
      const remainingTime = Math.ceil((60000 - timeDifference) / 1000);
      res.status(429).send({ "status": "error", "msg": `Please wait ${remainingTime} seconds before requesting a new OTP.` });
    } else {
      Otpcontroller.lastCallTime = currentTime;
      let otp = '';
      const { email } = req.body;
  
      for (var i = 1; i <= 4; i++) {
        let n = Math.round(Math.random() * 9);
        otp = otp + n;
      }
  
      try {
        const fu = await userModel.findOne({email})
        // console.log(fu)
        if(!fu){
            const user = await userModel.create({email})
            console.log("created new user")
        }

        const r = await otpModel.create({ otp, email });

        console.log(r);
  
        setTimeout(async () => {
          const d = await otpModel.deleteOne({ otp, email });
          console.log("d", d);
        }, 300000); // 60 seconds delay 300000
  
        res.send({ "status": "success", "otp": otp });
      } catch (error) {
        res.status(401).send({ "status": "failed", "msg": "something went wrong" });
      }
    }
  }
}

export default Otpcontroller;
