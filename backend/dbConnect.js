const { mongoose } = require("mongoose");

module.exports = async () => {
    const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.z3uk1lc.mongodb.net/?retryWrites=true&w=majority`;
    try {
        await mongoose.connect(uri);
        console.log("Connected To Mongo");
    } catch (e) {
        console.log("Unable to Connect to Database : " + e);
        process.exit(1);
    }
};
