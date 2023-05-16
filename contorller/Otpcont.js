import otpModel from "../models/otpModel.js";
import userModel from "../models/userModel.js";

class Otpcont {
  static genotp = async (req, res) => {
    const { email } = req.body;

    try {
      const currentTime = Date.now();
      let otpRecord = await otpModel.findOne({ email });

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

      function setCustomTimeout() {
        setTimeout(async () => {
          const d = await otpModel.deleteOne({ _id: otpRecord._id });
          console.log("d", d);
        }, 30000); // Deleting the OTP record after 5 minutes (300000 milliseconds)
      }

      setCustomTimeout()

      res.send({ "status": "success", "msg": otp });
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

