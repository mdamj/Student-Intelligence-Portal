import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import "./Dashboard.css";

const API_URL = "http://localhost:3000/api/students";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [city, setCity] = useState("All");
  const [placementStatus, setPlacementStatus] = useState("All");
  const [readiness, setReadiness] = useState("All");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 20;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      setStudents(response.data.students || []);

    } catch (error) {
      console.error("Student fetch error:", error);

      setError(
        "Unable to load student data. Make sure the backend is running."
      );

    } finally {
      setLoading(false);
    }
  };

  const courses = useMemo(() => {
    return [
      "All",
      ...new Set(
        students
          .map((student) => student.Course)
          .filter(Boolean)
      )
    ];
  }, [students]);

  const cities = useMemo(() => {
    return [
      "All",
      ...new Set(
        students
          .map((student) => student.City)
          .filter(Boolean)
      )
    ];
  }, [students]);

  const placementStatuses = useMemo(() => {
    return [
      "All",
      ...new Set(
        students
          .map((student) => student.Placement_Status)
          .filter(Boolean)
      )
    ];
  }, [students]);

  const filteredStudents = useMemo(() => {
    const text = search.toLowerCase();

    return students.filter((student) => {

      const matchesSearch =
        String(student.Student_ID || "")
          .toLowerCase()
          .includes(text) ||

        String(student.Student_Name || "")
          .toLowerCase()
          .includes(text) ||

        String(student.Course || "")
          .toLowerCase()
          .includes(text) ||

        String(student.City || "")
          .toLowerCase()
          .includes(text);

      const matchesCourse =
        course === "All" ||
        student.Course === course;

      const matchesCity =
        city === "All" ||
        student.City === city;

      const matchesPlacement =
        placementStatus === "All" ||
        student.Placement_Status === placementStatus;

      let matchesReadiness = true;

      if (readiness === "Ready") {
        matchesReadiness =
          Number(
            student.Placement_Readiness_Score || 0
          ) >= 70;
      }

      if (readiness === "Almost Ready") {
        matchesReadiness =
          Number(
            student.Placement_Readiness_Score || 0
          ) >= 50 &&
          Number(
            student.Placement_Readiness_Score || 0
          ) < 70;
      }

      if (readiness === "Needs Improvement") {
        matchesReadiness =
          Number(
            student.Placement_Readiness_Score || 0
          ) < 50;
      }

      return (
        matchesSearch &&
        matchesCourse &&
        matchesCity &&
        matchesPlacement &&
        matchesReadiness
      );
    });

  }, [
    students,
    search,
    course,
    city,
    placementStatus,
    readiness
  ]);
  const averageSkill =
    students.length > 0
      ? (
          students.reduce(
            (sum, student) =>
              sum +
              Number(student.Skill_Score || 0),
            0
          ) / students.length
        ).toFixed(1)
      : 0;

  const averageCommunication =
    students.length > 0
      ? (
          students.reduce(
            (sum, student) =>
              sum +
              Number(
                student.Communication_Score || 0
              ),
            0
          ) / students.length
        ).toFixed(1)
      : 0;

  const readyStudents = students.filter(
    (student) =>
      Number(
        student.Placement_Readiness_Score || 0
      ) >= 70
  ).length;

  const courseChartData = useMemo(() => {

    const result = {};

    students.forEach((student) => {

      const name =
        student.Course || "Unknown";

      result[name] =
        (result[name] || 0) + 1;

    });

    return Object.entries(result)
      .map(([name, count]) => ({
        name,
        count
      }))
      .sort((a, b) => b.count - a.count);

  }, [students]);

  const readinessChartData = useMemo(() => {

    let ready = 0;
    let almostReady = 0;
    let needsImprovement = 0;

    students.forEach((student) => {

      const score = Number(
        student.Placement_Readiness_Score || 0
      );

      if (score >= 70) {
        ready++;
      } else if (score >= 50) {
        almostReady++;
      } else {
        needsImprovement++;
      }

    });

    return [
      {
        name: "Ready",
        value: ready
      },
      {
        name: "Almost Ready",
        value: almostReady
      },
      {
        name: "Needs Improvement",
        value: needsImprovement
      }
    ];

  }, [students]);

  const totalPages = Math.ceil(
    filteredStudents.length /
      studentsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    studentsPerPage;

  const currentStudents =
    filteredStudents.slice(
      startIndex,
      startIndex + studentsPerPage
    );

  const resetFilters = () => {
    setSearch("");
    setCourse("All");
    setCity("All");
    setPlacementStatus("All");
    setReadiness("All");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Loading Student Intelligence Portal...</h2>
      </div>
    );
  }
  if (error) {
    return (
      <div className="error-screen">
        <h2>Something went wrong</h2>

        <p>{error}</p>

        <button onClick={fetchStudents}>
          Try Again
        </button>
      </div>
    );
  }
  

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>
          <h1>
            Student Intelligence Portal
          </h1>

          <p>
            Student Placement Intelligence
            Dashboard
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchStudents}
        >
          ↻ Refresh Data
        </button>

      </header>

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            👨‍🎓
          </div>

          <div>
            <span>Total Students</span>
            <strong>
              {students.length.toLocaleString()}
            </strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            📊
          </div>

          <div>
            <span>Average Skill Score</span>
            <strong>
              {averageSkill}
            </strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            💬
          </div>

          <div>
            <span>
              Communication Score
            </span>

            <strong>
              {averageCommunication}
            </strong>
          </div>

        </div>


        <div className="stat-card">

          <div className="stat-icon">
            🎯
          </div>

          <div>
            <span>Students Ready</span>

            <strong>
              {readyStudents.toLocaleString()}
            </strong>
          </div>

        </div>

      </section>
      <section className="charts-grid">

        <div className="chart-card">

          <div className="section-title">
            <h2>Students by Course</h2>
            <span>
              Course distribution
            </span>
          </div>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={courseChartData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>


        {/* READINESS CHART */}

        <div className="chart-card">

          <div className="section-title">

            <h2>
              Placement Readiness
            </h2>

            <span>
              Student readiness
            </span>

          </div>

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <PieChart>

              <Pie
                data={readinessChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >

                <Cell fill="#16a34a" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </section>
      <section className="filters-section">

        <div className="section-title">

          <div>
            <h2>
              Student Directory
            </h2>

            <span>
              {filteredStudents.length.toLocaleString()}
              {" "}students found
            </span>
          </div>

          <button
            className="reset-button"
            onClick={resetFilters}
          >
            Reset Filters
          </button>

        </div>


        <div className="filters">

          <input
            className="search-input"
            type="text"
            placeholder="Search student, ID, course or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />


          <select
            value={course}
            onChange={(e) => {
              setCourse(e.target.value);
              setCurrentPage(1);
            }}
          >

            {courses.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item === "All"
                  ? "All Courses"
                  : item}
              </option>
            ))}

          </select>


          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCurrentPage(1);
            }}
          >

            {cities.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item === "All"
                  ? "All Cities"
                  : item}
              </option>
            ))}

          </select>


          <select
            value={placementStatus}
            onChange={(e) => {
              setPlacementStatus(
                e.target.value
              );

              setCurrentPage(1);
            }}
          >

            {placementStatuses.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item === "All"
                    ? "All Placement Status"
                    : item}
                </option>
              )
            )}

          </select>


          <select
            value={readiness}
            onChange={(e) => {
              setReadiness(e.target.value);
              setCurrentPage(1);
            }}
          >

            <option value="All">
              All Readiness
            </option>

            <option value="Ready">
              Ready
            </option>

            <option value="Almost Ready">
              Almost Ready
            </option>

            <option value="Needs Improvement">
              Needs Improvement
            </option>

          </select>

        </div>

      </section>

      <section className="table-card">

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>Student ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>City</th>
                <th>Skill</th>
                <th>Communication</th>
                <th>Readiness</th>
                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {currentStudents.map(
                (student) => {

                  const readinessScore =
                    Number(
                      student.Placement_Readiness_Score ||
                      0
                    );

                  return (
                    <tr
                      key={
                        student._id ||
                        student.Student_ID
                      }
                    >

                      <td>
                        <span className="student-id">
                          {student.Student_ID}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {student.Student_Name}
                        </strong>
                      </td>

                      <td>
                        {student.Course}
                      </td>

                      <td>
                        {student.City}
                      </td>

                      <td>
                        <span className="score">
                          {student.Skill_Score}
                        </span>
                      </td>

                      <td>
                        {student.Communication_Score}
                      </td>

                      <td>

                        <span
                          className={
                            readinessScore >= 70
                              ? "badge ready"
                              : readinessScore >= 50
                              ? "badge almost"
                              : "badge improve"
                          }
                        >
                          {readinessScore}
                        </span>

                      </td>

                      <td>

                        <button
                          className="view-button"
                          onClick={() =>
                            setSelectedStudent(
                              student
                            )
                          }
                        >
                          View
                        </button>

                      </td>

                    </tr>
                  );

                }
              )}

            </tbody>

          </table>


          {currentStudents.length === 0 && (

            <div className="empty-state">

              <h3>
                No students found
              </h3>

              <p>
                Try changing your filters.
              </p>

            </div>

          )}

        </div>

        {totalPages > 1 && (

          <div className="pagination">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(
                  currentPage - 1
                )
              }
            >
              ← Previous
            </button>

            <span>
              Page {currentPage} of{" "}
              {totalPages}
            </span>

            <button
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  currentPage + 1
                )
              }
            >
              Next →
            </button>

          </div>

        )}

      </section>
      
      {selectedStudent && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedStudent(null)
          }
        >

          <div
            className="student-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <h2>
                  {selectedStudent.Student_Name}
                </h2>

                <p>
                  {selectedStudent.Student_ID}
                </p>

              </div>

              <button
                className="close-button"
                onClick={() =>
                  setSelectedStudent(null)
                }
              >
                ×
              </button>

            </div>


            <div className="student-profile">

              <div className="profile-item">
                <span>Batch</span>
                <strong>
                  {selectedStudent.Batch || "-"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Course</span>
                <strong>
                  {selectedStudent.Course || "-"}
                </strong>
              </div>

              <div className="profile-item">
                <span>City</span>
                <strong>
                  {selectedStudent.City || "-"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Education</span>
                <strong>
                  {selectedStudent.Education || "-"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Experience</span>
                <strong>
                  {selectedStudent.Experience || "-"}
                </strong>
              </div>

              <div className="profile-item">
                <span>Skill Score</span>
                <strong>
                  {selectedStudent.Skill_Score || 0}
                </strong>
              </div>

              <div className="profile-item">
                <span>Communication</span>
                <strong>
                  {
                    selectedStudent.Communication_Score ||
                    0
                  }
                </strong>
              </div>

              <div className="profile-item">
                <span>Mock Average</span>
                <strong>
                  {selectedStudent.Mock_Average || 0}
                </strong>
              </div>

              <div className="profile-item">
                <span>Interview Average</span>
                <strong>
                  {
                    selectedStudent.Interview_Average ||
                    0
                  }
                </strong>
              </div>

              <div className="profile-item">
                <span>Projects</span>
                <strong>
                  {
                    selectedStudent.Projects_Completed ||
                    0
                  }
                </strong>
              </div>

              <div className="profile-item">
                <span>Applications</span>
                <strong>
                  {
                    selectedStudent.Applications_Count ||
                    0
                  }
                </strong>
              </div>

              <div className="profile-item">
                <span>Profile Completion</span>
                <strong>
                  {
                    selectedStudent[
                      "Profile_Completion_%"
                    ] || 0
                  }%
                </strong>
              </div>

            </div>


            <div className="readiness-box">

              <span>
                Placement Readiness
              </span>

              <strong>
                {
                  selectedStudent.Placement_Readiness_Score ||
                  0
                }
              </strong>

              <p>
                {
                  selectedStudent.Readiness_Level ||
                  "Not Available"
                }
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;