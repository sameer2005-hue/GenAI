/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [loading, setLoadinq] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);

  return (
    <InterviewContext.Provider
      value={{ loading, setLoadinq, report, setReport, reports, setReports }}
    >
      {children}
    </InterviewContext.Provider>
  );
};
