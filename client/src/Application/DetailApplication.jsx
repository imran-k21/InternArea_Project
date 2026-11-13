import api from '../api';
import React, { useEffect, useState } from 'react'
import "./detailApplication.css";

function DeatilApplication() {
  const [data,setData] =useState(null)
  const [error,setError] = useState("")
  let search=window.location.search;
  const params=new URLSearchParams(search);
const id=params.get("a")
useEffect(()=>{
   let active = true;
   const fetchData = async () => {
     try {
       const response = await api.get(`/api/application/${id}`);
       if (active) setData(response.data);
     } catch (requestError) {
       if (active) setError(requestError.response?.data?.error || "Unable to load this application.");
     }
   };
   fetchData();
   return () => { active = false; };
},[id])
const handleAcceptAndReject= async(id,action)=>{
  try {
    const response=await api.put(`/api/application/${id}`,{action})
    setData(response.data.data)

  } catch (error) {
    console.log(error)
  }

}
if (error) {
  return <div className="application-detail-page"><div className="application-detail-card"><p role="alert">{error}</p></div></div>;
}
if (!data) {
  return (
    <div className="application-detail-page">
      <div className="application-detail-card">
        <p>Loading application details...</p>
      </div>
    </div>
  );
}

  return (
    <div className="application-detail-page">
      <div className="application-detail-card">
        <div className="application-detail-photo-wrap">
          <img
            alt={data?.user?.name || "Applicant"}
            className="application-detail-photo"
            src={data?.user?.photo}
          />
          <p className={`application-status ${(data?.status || "pending").toLowerCase()}`}>
            {data?.status || "Pending"}
          </p>
        </div>

        <div className="application-detail-content">
          <p className="application-label">Company</p>
          <h2 className="application-company">{data?.company}</h2>

          <p className="application-label">Cover Letter</p>
          <p className="application-cover-letter">{data?.coverLetter}</p>

          <div className="application-meta">
            <p>
              <span>Application Date</span>
              <strong>{new Date(data?.createAt).toLocaleDateString()}</strong>
            </p>
            <p>
              <span>Applied By</span>
              <strong>{data?.user?.name}</strong>
            </p>
          </div>

          <div className="application-admin-actions">
            <button
              className="application-action-btn accept"
              onClick={() => handleAcceptAndReject(data._id, "accepted")}
            >
              Accept
            </button>
            <button
              className="application-action-btn reject"
              onClick={() => handleAcceptAndReject(data._id, "rejected")}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeatilApplication