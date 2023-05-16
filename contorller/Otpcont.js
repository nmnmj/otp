import otpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";

class Otpcont {
  static genotp = async (req, res) => {
    const { email } = req.body;
    let otpRecord;
   


    try {
      otpRecord = await otpModel.findOne({ email });

      const currentTime = Date.now();
      let otp = '';

      if (otpRecord) {
        const otpTime = otpRecord.time.getTime();
        const timeDifference = currentTime - otpTime;

        if (timeDifference < 60000) {
          const remainingTime = Math.ceil((60000 - timeDifference) / 1000);
          return res.status(429).send({ "status": "error", "msg": `Please wait ${remainingTime} seconds before generating a new OTP.` });
        }
      }

      for (let i = 0; i < 4; i++) {
        let n = Math.floor(Math.random() * 10);
        n = n.toString();
        otp += n;
      }

      if (otpRecord) {
        await otpModel.findOneAndUpdate({ email }, { otp, time: currentTime });
        const r = await userModel.findOneAndUpdate({ email }, { attempt:0, time: currentTime });
      } else {
        otpRecord = await otpModel.create({ otp, email, time: currentTime });
        const r = await userModel.findOne({ email });
        if(!r){
            await userModel.create({email})
        }
      }

      setTimeout(async () => {
        const d = await otpModel.deleteOne({ _id: otpRecord._id });
        console.log("d", d);
      }, 300000); // Deleting the OTP record after 5 minutes (300000 milliseconds)

      res.send({ "status": "success", "msg": otp });
    } catch (error) {
      res.status(500).send({ "status": "error", "msg": "Something went wrong." });
    }
  }
}

export default Otpcont;
