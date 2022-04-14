import { client } from "./index.js";

export async function deletehalls() {
  return await client.db("b29wd").collection("halls").deleteMany();
}

export async function insertData(data) {
  return await client.db("b29wd").collection("halls").insertMany(data);
}

export async function findById(RoomID) {
  return await client.db("b29wd").collection("halls").findOne({ id: RoomID });
}

export async function update(RoomID, data) {
  return await client
    .db("b29wd")
    .collection("halls")
    .updateOne({ id: RoomID }, { $push: { Booking: data } });
}

export async function getAllhalls() {
  return await client.db("b29wd").collection("halls").find().toArray();
}

export async function getCustomers() {
  return await client
    .db("b29wd")
    .collection("halls")
    .find(
      {},
      {
        projection: {
          _id: 0,
          RoomName: 1,
          Booking: { "customer name": 1, date: 1, StartTime: 1, EndTime: 1 },
        },
      }
    )
    .toArray();
}
