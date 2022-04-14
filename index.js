import dotnev from "dotenv";
import express, { request, response } from "express";
import { MongoClient } from "mongodb";
import { checkBooking } from "./checkBooking.js";
import {
  deletehalls,
  insertData,
  findById,
  update,
  getAllhalls,
  getCustomers,
} from "./helper.js";

dotnev.config();
// creating the express server
const app = express();
//this method is initiated when we are on home page to retire some values
app.get("/", function (req, res) {
  res.send("Hello World");
});

// getting the mongodb connection url through env file and storing it
const MONGO_URL = process.env.MONGO_URL;

//create a connection between app and mongodb
async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo Connected");
  return client;
}
// we store the client variable to use the mongodb
export const client = await createConnection();

// we are giving a port number for the app to listen
app.listen(process.env.PORT, () => {
  console.log("Server started at PORT ", process.env.PORT);
});

app.get("/halls", async (req, res) => {
  res.send(await getAllhalls());
});
app.get("/halls/customers", async (req, res) => {
  res.send(await getCustomers());
});
//using the express middleware for every request and converting the data to json
app.use(express.json());

//creating the hall
app.post("/halls/create", async (req, res) => {
  res.send(await insertData(req.body));
});
app.delete("/halls", async (req, res) => {
  res.send(await deletehalls());
});

app.post("/halls/bookroom", async (req, res) => {
  const { RoomID, date, StartTime, EndTime } = req.body;
  var start = new Date(date + " " + StartTime);
  var end = new Date(date + " " + EndTime);
  const data = await findById(RoomID);
  if (data.Booking) {
    let arr = data.Booking,
      flag = true;
    flag = checkBooking(arr, start, end, flag);
    if (flag === false) {
      res.send({ messege: "Already booked in the specificed time" });
      return;
    }
  }
  res.send(await update(RoomID, req.body));
});
