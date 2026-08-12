import "dotenv/config";
import mongoose from "mongoose";
import XLSX from "xlsx";

const MONGO_URI = process.env.MONGODB_URI;

async function importExcel() {
  try {
    // =========================
    // CONNECT TO MONGODB
    // =========================

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB connected");


    // =========================
    // READ EXCEL FILE
    // =========================

    const workbook = XLSX.readFile(
      "./data/StackSmiths Hackathon.xlsx"
    );

    console.log("Excel file loaded");


    // =========================
    // P1_STUDENTS
    // =========================

    const studentsSheet =
      workbook.Sheets["P1_Students"];

    const students =
      XLSX.utils.sheet_to_json(studentsSheet);

    console.log(
      "Students:",
      students.length
    );


    // =========================
    // P1_ASSESSMENTS
    // =========================

    const assessmentsSheet =
      workbook.Sheets["P1_Assessments"];

    const assessments =
      XLSX.utils.sheet_to_json(
        assessmentsSheet
      );

    console.log(
      "Assessments:",
      assessments.length
    );


    // =========================
    // P1_JOBS
    // =========================

    const jobsSheet =
      workbook.Sheets["P1_Jobs"];

    const jobs =
      XLSX.utils.sheet_to_json(jobsSheet);

    console.log(
      "Jobs:",
      jobs.length
    );


    // =========================
    // P1_APPLICATIONS
    // =========================

    const applicationsSheet =
      workbook.Sheets["P1_Applications"];

    const applications =
      XLSX.utils.sheet_to_json(
        applicationsSheet
      );

    console.log(
      "Applications:",
      applications.length
    );


    // =========================
    // SKILL GAP
    // =========================

    const skillGapSheet =
      workbook.Sheets["Skill Gap"];

    const skillGaps =
      XLSX.utils.sheet_to_json(
        skillGapSheet
      );

    console.log(
      "Skill Gaps:",
      skillGaps.length
    );


    // =========================
    // PLACEMENT READINESS
    // =========================

    const readinessSheet =
      workbook.Sheets["PlacementReadiness"];

    const placementReadiness =
      XLSX.utils.sheet_to_json(
        readinessSheet
      );

    console.log(
      "Placement Readiness:",
      placementReadiness.length
    );


    // =========================
    // MONGODB DATABASE
    // =========================

    const db = mongoose.connection.db;

    console.log(
      "Clearing old imported data..."
    );


    // =========================
    // CLEAR OLD DATA
    // =========================

    await db
      .collection("students")
      .deleteMany({});

    await db
      .collection("assessments")
      .deleteMany({});

    await db
      .collection("jobs")
      .deleteMany({});

    await db
      .collection("applications")
      .deleteMany({});

    await db
      .collection("skillgaps")
      .deleteMany({});

    await db
      .collection("placementreadiness")
      .deleteMany({});


    console.log(
      "Old data cleared"
    );


    // =========================
    // INSERT STUDENTS
    // =========================

    if (students.length > 0) {

      await db
        .collection("students")
        .insertMany(students);

      console.log(
        `${students.length} students imported`
      );
    }


    // =========================
    // INSERT ASSESSMENTS
    // =========================

    if (assessments.length > 0) {

      await db
        .collection("assessments")
        .insertMany(assessments);

      console.log(
        `${assessments.length} assessments imported`
      );
    }


    // =========================
    // INSERT JOBS
    // =========================

    if (jobs.length > 0) {

      await db
        .collection("jobs")
        .insertMany(jobs);

      console.log(
        `${jobs.length} jobs imported`
      );
    }


    // =========================
    // INSERT APPLICATIONS
    // =========================

    if (applications.length > 0) {

      await db
        .collection("applications")
        .insertMany(applications);

      console.log(
        `${applications.length} applications imported`
      );
    }


    // =========================
    // INSERT SKILL GAPS
    // =========================

    if (skillGaps.length > 0) {

      await db
        .collection("skillgaps")
        .insertMany(skillGaps);

      console.log(
        `${skillGaps.length} skill gaps imported`
      );
    }


    // =========================
    // INSERT PLACEMENT READINESS
    // =========================

    if (placementReadiness.length > 0) {

      await db
        .collection("placementreadiness")
        .insertMany(
          placementReadiness
        );

      console.log(
        `${placementReadiness.length} placement readiness records imported`
      );
    }


    // =========================
    // COMPLETE
    // =========================

    console.log("");
    console.log(
      "================================"
    );

    console.log(
      "EXCEL IMPORT COMPLETED SUCCESSFULLY"
    );

    console.log(
      "================================"
    );

    console.log(
      `Students: ${students.length}`
    );

    console.log(
      `Assessments: ${assessments.length}`
    );

    console.log(
      `Jobs: ${jobs.length}`
    );

    console.log(
      `Applications: ${applications.length}`
    );

    console.log(
      `Skill Gaps: ${skillGaps.length}`
    );

    console.log(
      `Placement Readiness: ${placementReadiness.length}`
    );

    console.log(
      "================================"
    );


  } catch (error) {

    console.error("");

    console.error(
      "================================"
    );

    console.error(
      "EXCEL IMPORT FAILED"
    );

    console.error(
      "================================"
    );

    console.error(
      error.message
    );

  } finally {

    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed"
    );
  }
}

importExcel();