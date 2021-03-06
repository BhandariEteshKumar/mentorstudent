import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import { studentsRouter, mentorsRouter } from "./routes.js";

dotenv.config();
const app = express();
let PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
// mongo db config
const MONGO_URL = process.env.MONGO_URL;

// create db connection

async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("DataBase Connected");
  return client;
}

export const client = await createConnection();

app.use("/students", studentsRouter);
app.use("/mentors", mentorsRouter);

//  it will reassign all students

app.put("/reassign", async (req, res) => {
  const students = await client
      .db("mentorstudent")
      .collection("students")
      .find()
      .toArray(),
    mentors = await client
      .db("mentorstudent")
      .collection("mentors")
      .find()
      .toArray();

  let i = 0; // initialize the loop with 0 @ start
  let S = students.length; // number of students
  let M = mentors.length; // number of menotrs
  let num = S / M; // number of students gonna assign per mentor
  let menCop = mentors;
  let stuCop = students;

  num = `${num}`;
  num = num.split(".");
  num = !num[1] ? +num.join("") : +num[0] + 1;

  // logic loop

  menCop.forEach(({ name, mentorId, mentorName, students }) => {
    // mentor loop 2 time
    let dataForMentor = [];
    // student loop num times
    for (let stuLoop = i; stuLoop < i + num; stuLoop++) {
      if (!stuCop[stuLoop]) {
        break;
      } else {
        dataForMentor.push({
          name: stuCop[stuLoop].name,
          studentId: stuCop[stuLoop].studentId,
          studentName: stuCop[stuLoop].studentName,
        });

        let updateStudent = client
          .db("mentorstudent")
          .collection("students")
          .updateOne(
            { studentId: `220${stuLoop + 1}` },
            {
              $set: {
                mentorDetails: { name, mentorId, mentorName },
                mentorstudent: true,
              },
            }
          );
      }
    }

    let updateMentor = client
      .db("mentorstudent")
      .collection("mentors")
      .updateOne(
        { mentorId },
        {
          $set: {
            students: dataForMentor,
            numOfStudents: dataForMentor.length,
          },
        }
      );

    i = i + num;
  });

  res.send({ message: "auto assign done" });
});

//  assign unassigned one

app.put("/assign", async (req, res) => {
  const students = await client
      .db("mentorstudent")
      .collection("students")
      .find({ mentorstudent: false })
      .toArray(),
    mentors = await client
      .db("mentorstudent")
      .collection("mentors")
      .find()
      .toArray();

  let i = 0; // initialize the loop with 0 @ start
  let S = students.length; // number of students
  let M = mentors.length; // number of menotrs
  let num = S / M; // number of students gonna assign per mentor
  let menCop = mentors;
  let stuCop = students,
    result = [];

  num = `${num}`;
  num = num.split(".");
  num = !num[1] ? +num.join("") : +num[0] + 1;

  console.log(S, M, num);

  // logic loop
  if (S > 0) {
    menCop.forEach(({ name, mentorId, mentorName, students }) => {
      // mentor loop 2 time
      let dataForMentor = [...students];
      // student loop num times
      for (let stuLoop = i; stuLoop < i + num; stuLoop++) {
        if (!stuCop[stuLoop]) {
          break;
        } else {
          dataForMentor.push({
            name: stuCop[stuLoop].name,
            studentId: stuCop[stuLoop].studentId,
            studentName: stuCop[stuLoop].studentName,
          });

          let updateStudent = client
            .db("mentorstudent")
            .collection("students")
            .updateOne(
              { studentId: stuCop[stuLoop].studentId },
              {
                $set: {
                  mentorDetails: { name, mentorId, mentorName },
                  mentorstudent: true,
                },
              }
            );
        }
      }

      let updateMentor = client
        .db("mentorstudent")
        .collection("mentors")
        .updateOne(
          { mentorId },
          {
            $set: {
              students: dataForMentor,
              numOfStudents: dataForMentor.length,
            },
          }
        );

      i = i + num;
      result = [...result, ...dataForMentor];
    });
    res.send({ message: "auto assign done", data: result });
  } else {
    res.send({ message: "all are assigned already" });
  }
});

app.listen(PORT, () => {
  console.log("Server started at " + PORT);
});
