import { useState } from "react";
import Home from "./pages/home/home";
import StudentSignIn from "./pages/logins/studentLogin";
import { Routes, Route } from "react-router-dom";
import { StudentLanding } from "./pages/landing/studentLanding";
import { CreateComplaint } from "./pages/components_student/createComplaint";
import { Attendance } from "./pages/components_student/attendance";
import ProfLogin from "./pages/logins/profLogin";
import { ProfLanding } from "./pages/landing/profLanding";

function Routing() {

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studentlogin" element={<StudentSignIn />} />
            <Route path="/teacherLogin" element={<ProfLogin />} />
            <Route path="/studentLanding" element={<StudentLanding />} />
            <Route path="/createComplaint" element={<CreateComplaint />} />
            <Route path="/studentAtendance" element={<Attendance />} />
            <Route path="/profLanding" element={<ProfLanding />} />
        </Routes>
    );
}

export default Routing;
