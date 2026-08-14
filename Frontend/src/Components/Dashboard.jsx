import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");

  return {
    Authorization: `Bearer ${token}`
  };
};

function Dashboard() {
  const navigate = useNavigate();
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

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/signin", { replace: true });
  };

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/api/students`,
        {
          headers: getAuthHeaders()
        }
      );

      setStudents(response.data.students || []);
    } catch (error) {
      console.error("Student fetch error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/signin", { replace: true });
        return;
      }

      setError(
        "Unable to load student data. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchStudents]);

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

        <div className="dashboard-actions">
          <button
            className="refresh-button"
            onClick={fetchStudents}
          >
            ↻ Refresh Data
          </button>

          <button
            className="refresh-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>

      </header>

      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            <svg width="133px" height="133px" viewBox="-0.64 -0.64 33.28 33.28" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#c00c0c" stroke-width="0.544"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M23.3 8.40007L21.82 6.40008C21.7248 6.27314 21.6009 6.17066 21.4583 6.10111C21.3157 6.03156 21.1586 5.99693 21 6.00008H11.2C11.0556 6.00007 10.9128 6.03135 10.7816 6.09177C10.6504 6.15219 10.5339 6.24031 10.44 6.35007L8.72 8.35008C8.57229 8.53401 8.49437 8.76424 8.5 9.00008V16.2901C8.50264 18.0317 9.19568 19.7013 10.4272 20.9328C11.6588 22.1644 13.3283 22.8574 15.07 22.8601H16.93C18.6717 22.8574 20.3412 22.1644 21.5728 20.9328C22.8043 19.7013 23.4974 18.0317 23.5 16.2901V9.00008C23.5 8.7837 23.4298 8.57317 23.3 8.40007Z" fill="#FFCC80"></path> <path d="M29.78 28.38L25.78 23.38C25.664 23.2321 25.5087 23.1198 25.3318 23.0562C25.1549 22.9925 24.9637 22.98 24.78 23.02L16 25L7.22 23C7.03633 22.96 6.84509 22.9725 6.66822 23.0362C6.49134 23.0998 6.336 23.2121 6.22 23.36L2.22 28.36C2.10393 28.5064 2.03117 28.6823 2.00996 28.8679C1.98875 29.0534 2.01994 29.2413 2.1 29.41C2.17816 29.5839 2.30441 29.7319 2.46387 29.8364C2.62333 29.9409 2.80935 29.9977 3 30H29C29.1885 29.9995 29.373 29.9457 29.5322 29.8448C29.6915 29.744 29.819 29.6002 29.9 29.43C29.9801 29.2613 30.0112 29.0734 29.99 28.8879C29.9688 28.7023 29.8961 28.5264 29.78 28.38Z" fill="#01579B"></path> <path d="M29.29 6.00003L16.29 2.00003C16.0999 1.95002 15.9001 1.95002 15.71 2.00003L2.71 6.00003C2.49742 6.06422 2.31226 6.19735 2.1837 6.37841C2.05515 6.55947 1.99052 6.77817 2 7.00003C1.9917 7.22447 2.0592 7.44518 2.19163 7.62659C2.32405 7.80799 2.5137 7.93954 2.73 8.00003L15.73 11.6C15.906 11.6534 16.094 11.6534 16.27 11.6L29.27 8.00003C29.4863 7.93954 29.6759 7.80799 29.8084 7.62659C29.9408 7.44518 30.0083 7.22447 30 7.00003C30.0095 6.77817 29.9448 6.55947 29.8163 6.37841C29.6877 6.19735 29.5026 6.06422 29.29 6.00003Z" fill="#01579B"></path> <path d="M11.22 6C11.0756 5.99999 10.9328 6.03127 10.8016 6.09169C10.6704 6.15211 10.5539 6.24023 10.46 6.35L8.74 8.35C8.58509 8.53114 8.49998 8.76166 8.5 9V16.29C8.50264 18.0317 9.19569 19.7012 10.4272 20.9328C11.6588 22.1643 13.3283 22.8574 15.07 22.86H16V6H11.22Z" fill="#FFE0B2"></path> <path d="M7.22 23C7.03633 22.96 6.84509 22.9725 6.66822 23.0362C6.49134 23.0998 6.336 23.2121 6.22 23.36L2.22 28.36C2.10393 28.5064 2.03117 28.6823 2.00996 28.8679C1.98875 29.0534 2.01994 29.2413 2.1 29.41C2.17816 29.5839 2.30441 29.7319 2.46387 29.8364C2.62333 29.9409 2.80935 29.9977 3 30H16V25L7.22 23Z" fill="#0277BD"></path> <path d="M15.71 2.00002L2.71 6.00002C2.49742 6.06422 2.31226 6.19734 2.1837 6.3784C2.05515 6.55947 1.99052 6.77817 2 7.00002C1.9917 7.22447 2.0592 7.44518 2.19163 7.62658C2.32405 7.80799 2.5137 7.93954 2.73 8.00002L15.73 11.6C15.8194 11.6146 15.9106 11.6146 16 11.6V2.00002C15.9039 1.98469 15.8061 1.98469 15.71 2.00002Z" fill="#0277BD"></path> </g></svg>
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
            <svg fill="#983e3e" height="99px" width="99px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-19.8 -19.8 369.60 369.60" xml:space="preserve" stroke="#983e3e" stroke-width="1.980006"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="XMLID_85_" d="M320.462,1.031c-5.752-2.25-12.294-0.742-16.484,3.796L192.625,125.459l-49.229-32.495 c-0.008-0.006-0.017-0.011-0.025-0.017l-0.107-0.071c-0.18-0.119-0.367-0.218-0.55-0.328c-0.205-0.123-0.404-0.254-0.614-0.367 c-0.4-0.215-0.806-0.411-1.218-0.587c-0.173-0.074-0.354-0.131-0.53-0.199c-0.262-0.1-0.522-0.204-0.788-0.289 c-0.183-0.059-0.372-0.103-0.559-0.155c-0.27-0.075-0.539-0.149-0.811-0.209c-0.184-0.04-0.371-0.07-0.559-0.103 c-0.287-0.051-0.573-0.097-0.861-0.131c-0.18-0.021-0.36-0.037-0.542-0.052c-0.309-0.025-0.616-0.041-0.925-0.047 c-0.104-0.002-0.204-0.016-0.308-0.016c-0.072,0-0.142,0.01-0.213,0.011c-0.315,0.005-0.629,0.023-0.943,0.048 c-0.171,0.013-0.342,0.021-0.511,0.039c-0.316,0.036-0.629,0.089-0.941,0.144c-0.198,0.035-0.396,0.066-0.592,0.109 c-0.391,0.085-0.779,0.182-1.162,0.299c-0.211,0.063-0.414,0.144-0.621,0.216c-0.231,0.081-0.463,0.16-0.691,0.253 c-0.202,0.082-0.397,0.176-0.594,0.267c-0.227,0.104-0.453,0.209-0.676,0.326c-0.184,0.096-0.363,0.2-0.543,0.304 c-0.226,0.13-0.448,0.263-0.667,0.405c-0.169,0.11-0.335,0.224-0.499,0.34c-0.215,0.152-0.427,0.31-0.635,0.475 c-0.16,0.126-0.317,0.255-0.472,0.388c-0.195,0.168-0.385,0.342-0.573,0.521c-0.155,0.147-0.308,0.296-0.456,0.45 c-0.069,0.072-0.144,0.135-0.212,0.208l-120,129.472C1.429,227.445,0,231.087,0,234.868v80.133c0,8.284,6.716,15,15,15h300 c8.284,0,15-6.716,15-15v-300C330,8.824,326.215,3.28,320.462,1.031z M120,300.001H90V176.014l30-32.369V300.001z M150,133.27 l30,19.803v146.928h-30V133.27z M210,150.865l30-32.5v181.635h-30V150.865z M30,240.75l30-32.368v91.619H30V240.75z M300,300.001 h-30V85.866l30-32.5V300.001z"></path> </g></svg>
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
            <svg fill="#772828" width="126px" height="126px" viewBox="0 0 64 64" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" stroke="#772828"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="smart_lamp"></g> <g id="e-wallet"></g> <g id="virtual_reality"></g> <g id="payment"></g> <g id="cloud_storage"></g> <g id="security_camera"></g> <g id="smart_home"></g> <g id="connection"></g> <g id="game"></g> <g id="drone"></g> <g id="smart_car"></g> <g id="camera"></g> <g id="online_business"></g> <g id="smartwatch"></g> <g id="online_shopping"></g> <g id="smart_Television"></g> <g id="security"></g> <g id="communication"> <g> <path d="M35,30c2.2,0,4-1.8,4-4s-1.8-4-4-4c-2.2,0-4,1.8-4,4S32.8,30,35,30z M35,24c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2 S33.9,24,35,24z"></path> <path d="M24,30c2.2,0,4-1.8,4-4s-1.8-4-4-4s-4,1.8-4,4S21.8,30,24,30z M24,24c1.1,0,2,0.9,2,2s-0.9,2-2,2s-2-0.9-2-2 S22.9,24,24,24z"></path> <path d="M13,22c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S15.2,22,13,22z M13,28c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S14.1,28,13,28z "></path> <path d="M60.3,9.1c-0.4-0.1-0.8,0-1.1,0.3l-8.5,10.2C50,20.5,48.8,21,47.7,21H45v-6c0-3.3-2.7-6-6-6H9c-3.3,0-6,2.7-6,6v39 c0,0.4,0.3,0.8,0.7,0.9C3.8,55,3.9,55,4,55c0.3,0,0.6-0.1,0.8-0.4l8.5-10.2c0.8-0.9,1.9-1.4,3.1-1.4H19v6c0,3.3,2.7,6,6,6h30 c3.3,0,6-2.7,6-6V10C61,9.6,60.7,9.2,60.3,9.1z M11.7,43.2L5,51.2V15c0-2.2,1.8-4,4-4h30c2.2,0,4,1.8,4,4v22c0,2.2-1.8,4-4,4H16.3 C14.6,41,12.9,41.8,11.7,43.2z M59,49c0,2.2-1.8,4-4,4H25c-2.2,0-4-1.8-4-4v-6h18c3.3,0,6-2.7,6-6V23h2.7c1.8,0,3.5-0.8,4.6-2.2 l6.7-8.1V49z"></path> <path d="M47,38c0,2.2,1.8,4,4,4s4-1.8,4-4s-1.8-4-4-4S47,35.8,47,38z M53,38c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S53,36.9,53,38z "></path> </g> </g> <g id="remote_control"></g> <g id="satelite_dish"></g> </g></svg>
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
            <svg width="159px" height="159px" viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#d28cf2" stroke="#d28cf2"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M502.922 790.669c-152.755-1.391-276.788-125.42-278.177-278.177-0.661-72.618 29.297-142.754 79.451-194.66 52.395-54.221 124.439-82.84 198.726-83.516 71.011-0.646 71.074-110.824 0-110.177-212.832 1.937-386.417 175.518-388.354 388.353-1.937 212.854 178.438 386.443 388.354 388.354 71.073 0.644 71.011-109.531 0-110.177z" fill="#4C5AA3"></path><path d="M521.098 234.316c152.756 1.39 276.79 125.42 278.18 278.176 0.662 72.62-29.297 142.755-79.453 194.658-52.394 54.224-124.439 82.843-198.727 83.519-71.012 0.646-71.074 110.821 0 110.177 212.834-1.937 386.42-175.52 388.357-388.354 1.936-212.856-178.442-386.441-388.357-388.353-71.074-0.647-71.012 109.532 0 110.177z" fill="#D860B5"></path><path d="M410.657 510.563c-0.041-57.184 42.743-103.075 99.009-105.283 57.153-2.242 103.141 44.402 105.284 99.008 1.178 29.998 24.167 55.089 55.088 55.089 29.14 0 56.268-25.066 55.089-55.089-4.579-116.64-97.827-209.263-215.461-209.184-116.738 0.078-209.264 101.213-209.185 215.459 0.05 71.046 110.226 71.052 110.176 0z" fill="#FD9E22"></path><path d="M613.412 516.021c-1.083 56.13-46.052 101.095-102.18 102.176-56.155 1.084-101.125-47.673-102.175-102.176-1.369-70.956-111.547-71.089-110.177 0 2.258 117.153 95.202 210.093 212.352 212.353 117.147 2.259 210.164-98.607 212.356-212.353 1.371-71.09-108.807-70.956-110.176 0z" fill="#F35A50"></path><path d="M1014.707 512.492c0 22.698-19.031 41.099-42.513 41.099H792.696c-23.479 0-42.514-18.4-42.514-41.099 0-22.696 19.035-41.095 42.514-41.095h179.499c23.481 0 42.512 18.399 42.512 41.095zM273.579 514.308c0 22.696-19.033 41.095-42.517 41.095H51.563c-23.478 0-42.511-18.398-42.511-41.095 0-22.698 19.033-41.099 42.511-41.099h179.499c23.484 0 42.517 18.401 42.517 41.099zM510.838 272.762c-22.693 0-41.094-19.029-41.094-42.513V50.75c0-23.477 18.401-42.51 41.094-42.51 22.7 0 41.1 19.033 41.1 42.51v179.499c0 23.483-18.4 42.515-41.1 42.513zM510.838 1019.117c-22.693 0-41.094-19.031-41.094-42.513v-179.5c0-23.477 18.401-42.513 41.094-42.513 22.7 0 41.1 19.036 41.1 42.513v179.501c0 23.481-18.4 42.512-41.1 42.512z" fill="#F9D73B"></path></g></svg>
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