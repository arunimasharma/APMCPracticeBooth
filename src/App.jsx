import { useState } from 'react';
import { useEffect, useRef } from 'react';
import reactLogo from './assets/react.svg';
import apmcLogo from './assets/APMC.png';
import viteLogo from '/vite.svg';
import './App.css';
import { useReactMediaRecorder } from "react-media-recorder";
import questionsData from './pm_questions.json';

function App() {
  // State hooks for form inputs
  const [profileURL, setProfileURL] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [weakAreas, setWeakAreas] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Added missing state variable
  
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl
  } = useReactMediaRecorder({ video: true });

  const handleGenerateSummary = () => {
    let summary = "";
    if (postAnonymous) {
      summary += `An **anonymous** PM candidate answered:\n"${selectedQuestion}".\n`;
    } else {
      // Use profile URL or a generic label if not provided
      summary += `**${profileURL || "A PM candidate"}** answered:\n"${selectedQuestion}".\n`;
    }
    // Add context information
    summary += `_Interview Type_: ${interviewType || "N/A"}, _Company Type_: ${companyType || "N/A"}.\n`;
    summary += "Thank you for listening to my practice response!";
    setSummaryText(summary);
  };

  const handleGetNewQuestions = () => {
    if (!interviewType) {
      alert("Please select an interview type first.");
      return;
    }
    
    const categoryMatches = questionsData.filter(q => q.category === interviewType);
    // Apply partial keyword filter if a search term is provided
    const keyword = searchTerm.trim().toLowerCase();
    let filtered = categoryMatches;
    if (keyword) {
      filtered = categoryMatches.filter(q => 
        q.question.toLowerCase().includes(keyword)
      );
    }
    // Now pick up to 5 from 'filtered'
    const result = filtered.length <= 5 
      ? filtered 
      : [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(result.map(item => item.question));
    setSelectedQuestion("");
  };
  
  const handleGetQuestions = () => {
    // Simple logic to generate questions based on inputs
    if (!interviewType) {
      alert("Please select an interview type first.");
      return;
    }
    
    try {
      // Filter the questions by the chosen interview type category
      const filtered = questionsData.filter(q => q.category === interviewType);

      let selectedQuestions;
      if (filtered.length <= 5) {
        // If 5 or fewer questions, use them all
        selectedQuestions = filtered;
      } else {
        // If more than 5, randomly shuffle and take the first 5
        selectedQuestions = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
      }

      // Update the state with the selected questions
      setQuestions(selectedQuestions.map(item => item.question));
      // Clear any previously selected question (reset radio selection)
      setSelectedQuestion("");
    } catch (error) {
      console.error("Error fetching questions:", error);
      
      // Fallback to hardcoded questions if there's an error
      let suggested = [];
      if (interviewType === "Product Sense") {
        suggested = [
          `How would you improve a product from a ${companyType} company?`,
          "What is your favorite product and how would you improve it?"
        ];
      } else if (interviewType === "Estimation") {
        suggested = [
          "Estimate the market size for ride-sharing services in your city.",
          "How many people order takeout in New York on a Friday night?"
        ];
      } else if (interviewType === "Behavioral") {
        suggested = [
          "Tell me about a time you had to work with a difficult team member.",
          "Describe a project you led that didn't go as planned. What did you learn?"
        ];
      } else {
        // Fallback questions if type is not selected or unrecognized
        suggested = [
          "Why do you want to be a product manager at our company?",
          "Tell me about a product you admire and why."
        ];
      }
      setQuestions(suggested);
    }
  };

  return (
    <>
      <div>
        <a href="https://www.linkedin.com/company/theapmclub/" target="_blank" rel="noreferrer">
          <img src={apmcLogo} className="logo apmc" alt="APM Club logo" />
        </a>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <main className="container">
        <h2>🎥 APM Club Interview Practice Booth</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleGetQuestions(); }}>
          <fieldset>
            <label htmlFor="profile-url">LinkedIn Profile URL</label>
            <input 
              type="url"
              id="profile-url"
              placeholder="https://www.linkedin.com/in/your-profile"
              value={profileURL}
              onChange={e => setProfileURL(e.target.value)}
              required
            />
          </fieldset>

          <fieldset>
            <label htmlFor="company-type">Company Type</label>
            <input 
              type="text"
              id="company-type"
              placeholder="e.g. Big Tech, Startup, Fintech..."
              value={companyType}
              onChange={e => setCompanyType(e.target.value)}
              required
            />
          </fieldset>

          <fieldset>
            <label htmlFor="interview-type">Interview Prep Type</label>
            <select 
              id="interview-type"
              value={interviewType}
              onChange={e => setInterviewType(e.target.value)}
              required
            >
              <option value="">-- Select Interview Type --</option>
              <option value="Product Sense">Product Sense</option>
              <option value="Analytical Thinking">Analytical Thinking</option>
              <option value="Behavioral">Behavioral</option>
            </select>
          </fieldset>

          <fieldset>
            <label htmlFor="weak-areas">
              Areas you lack practice in:
              <input 
                type="text"
                id="weak-areas"
                value={weakAreas} 
                onChange={e => setWeakAreas(e.target.value)} 
                placeholder="E.g. metrics, A/B testing, leadership..." 
                required 
              />
            </label>
          </fieldset>
          
          <button type="submit">Get Practice Questions</button>
        </form>
        
        {/* Search and Filter Section */}
        {questions.length > 0 && (
          <div className="search-section">
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            <button onClick={handleGetNewQuestions}>Get New Questions</button>
          </div>
        )}
        
        {/* Questions Section */}
        {questions.length > 0 && (
          <div>
            <fieldset>
              <legend>Suggested Questions:</legend>
              {questions.map((q, index) => (
                <label key={index} className="question-option">
                  <input 
                    type="radio" 
                    name="selectedQuestion" 
                    value={q}
                    checked={selectedQuestion === q}
                    onChange={() => setSelectedQuestion(q)} 
                  />
                  {q}
                </label>
              ))}
            </fieldset>
          </div>
        )}
        
        {selectedQuestion && (
          <div>
            <h3>Recording Answer for:</h3>
            <p>❓ <em>{selectedQuestion}</em></p>
            <div>
              {status !== "recording" ? (
                <button onClick={startRecording}>Start Recording</button>
              ) : (
                <button onClick={stopRecording}>Stop Recording</button>
              )}
            </div>
            {mediaBlobUrl && (
              <div>
                <video src={mediaBlobUrl} controls></video>
                <p><a href={mediaBlobUrl} download={`APMC_Practice_${Date.now()}.webm`}>Download Recording</a></p>
                <label>
                  <input 
                    type="checkbox" 
                    checked={postAnonymous} 
                    onChange={e => setPostAnonymous(e.target.checked)} 
                  />
                  Post anonymously (do not attach my LinkedIn profile)
                </label>
                <button onClick={handleGenerateSummary}>
                  Generate Summary Text
                </button>
              </div>
            )}
            {summaryText && (
              <article>
                <h4>Submission Summary:</h4>
                <p>
                  {summaryText.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {line}<br/>
                    </span>
                  ))}
                </p>
              </article>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default App;


// import { useState } from 'react';
// import { useEffect, useRef } from 'react';
// import reactLogo from './assets/react.svg';
// import apmcLogo from './assets/APMC.png';
// import viteLogo from '/vite.svg';
// import './App.css';
// import { useReactMediaRecorder } from "react-media-recorder";
// import questionsData from './pm_questions.json';

// function App() {
//   // State hooks for form inputs
//   const [profileURL, setProfileURL] = useState("");
//   const [companyType, setCompanyType] = useState("");
//   const [interviewType, setInterviewType] = useState("");
//   const [weakAreas, setWeakAreas] = useState(""); // Added missing state variable
//   const [questions, setQuestions] = useState([]);
//   const [selectedQuestion, setSelectedQuestion] = useState("");
//   const [postAnonymous, setPostAnonymous] = useState(false);
//   const [summaryText, setSummaryText] = useState("");
//   const [displayedQuestions, setDisplayedQuestions] = useState([]);
  
//   const {
//     status,
//     startRecording,
//     stopRecording,
//     mediaBlobUrl
//   } = useReactMediaRecorder({ video: true });

//   const handleGenerateSummary = () => {
//     let summary = "";
//     if (postAnonymous) {
//       summary += `An **anonymous** PM candidate answered:\n"${selectedQuestion}".\n`;
//     } else {
//       // Use profile URL or a generic label if not provided
//       summary += `**${profileURL || "A PM candidate"}** answered:\n"${selectedQuestion}".\n`;
//     }
//     // Add context information
//     summary += `_Interview Type_: ${interviewType || "N/A"}, _Company Type_: ${companyType || "N/A"}.\n`;
//     summary += "Thank you for listening to my practice response!";
//     setSummaryText(summary);
//   };

//   const handleGetNewQuestions = () => {
//     const categoryMatches = questionsData.filter(q => q.category === interviewType);
//     // Apply partial keyword filter if a search term is provided
//     const keyword = searchTerm.trim().toLowerCase();
//     let filtered = categoryMatches;
//     if (keyword) {
//       filtered = categoryMatches.filter(q => 
//         q.question.toLowerCase().includes(keyword)
//       );
//     }
//     // Now pick up to 5 from 'filtered' (same as before)
//     const result = filtered.length <= 5 
//       ? filtered 
//       : [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
//     setQuestions(result.map(item => item.question));
//     setSelectedQuestion("");
//   };
  
//   const handleGetQuestions = () => {
//     // Simple logic to generate questions based on inputs
//     if (!interviewType) {
//       alert("Please select an interview type first.");
//       return;
//     }
//     // Filter the questions by the chosen interview type category
//     const filtered = questionsData.filter(q => q.category === interviewType);

//     let selectedQuestions;
//     if (filtered.length <= 5) {
//       // If 5 or fewer questions, use them all
//       selectedQuestions = filtered;
//     } else {
//       // If more than 5, randomly shuffle and take the first 5
//       selectedQuestions = [...filtered].sort(() => Math.random() - 0.5).slice(0, 5);
//     }

//     // Update the state with the selected questions
//     setQuestions(selectedQuestions.map(item => item.question));
//     // Clear any previously selected question (reset radio selection)
//     setSelectedQuestion("");

//     // let suggested = [];
//     // if (interviewType === "Product Sense") {
//     //   suggested = [
//     //     `How would you improve a product from a ${companyType} company?`,
//     //     "What is your favorite product and how would you improve it?"
//     //   ];
//     // } else if (interviewType === "Estimation") {
//     //   suggested = [
//     //     "Estimate the market size for ride-sharing services in your city.",
//     //     "How many people order takeout in New York on a Friday night?"
//     //   ];
//     // } else if (interviewType === "Behavioral") {
//     //   suggested = [
//     //     "Tell me about a time you had to work with a difficult team member.",
//     //     "Describe a project you led that didn't go as planned. What did you learn?"
//     //   ];
//     // } else {
//     //   // Fallback questions if type is not selected or unrecognized
//     //   suggested = [
//     //     "Why do you want to be a product manager at our company?",
//     //     "Tell me about a product you admire and why."
//     //   ];
//     // }
//     // setQuestions(suggested);
//   };

//   return (
//     <>
//       <div>
//         <a href="https://www.linkedin.com/company/theapmclub/" target="_blank" rel="noreferrer">
//           <img src={apmcLogo} className="logo apmc" alt="APM Club logo" />
//         </a>
//         <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank" rel="noreferrer">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <main className="container">
//         <h2>🎥 APM Club Interview Practice Booth</h2>
//         <form onSubmit={(e) => { e.preventDefault(); handleGetQuestions(); }}>
//           <fieldset>
//             <label htmlFor="profile-url">LinkedIn Profile URL</label>
//             <input 
//               type="url"
//               id="profile-url"
//               placeholder="https://www.linkedin.com/in/your-profile"
//               value={profileURL}
//               onChange={e => setProfileURL(e.target.value)}
//               required
//             />
//           </fieldset>

//           <fieldset>
//             <label htmlFor="company-type">Company Type</label>
//             <input 
//               type="text"
//               id="company-type"
//               placeholder="e.g. Big Tech, Startup, Fintech..."
//               value={companyType}
//               onChange={e => setCompanyType(e.target.value)}
//               required
//             />
//           </fieldset>

//           <fieldset>
//             <label htmlFor="interview-type">Interview Prep Type</label>
//             <select 
//               id="interview-type"
//               value={interviewType}
//               onChange={e => setInterviewType(e.target.value)}
//               required
//             >
//               <option value="">-- Select Interview Type --</option>
//               <option value="Product Sense">Product Sense</option>
//               <option value="Estimation">Analytical Thinking/Estimation</option>
//               <option value="Behavioral">Behavioral</option>
//             </select>
//           </fieldset>

//           <fieldset>
//             <label htmlFor="weak-areas">
//               Areas you lack practice in:
//               <input 
//                 type="text"
//                 id="weak-areas"
//                 value={weakAreas} 
//                 onChange={e => setWeakAreas(e.target.value)} 
//                 placeholder="E.g. metrics, A/B testing, leadership..." 
//                 required 
//               />
//             </label>
//           </fieldset>
          
//           <button type="submit">Get Practice Questions</button>
//         </form>
        
//         {questions.length > 0 && (
//           <div>
//             <fieldset>
//               <legend>Suggested Questions:</legend>
//               {questions.map((q, index) => (
//                 <label key={index}>
//                   <input 
//                     type="radio" 
//                     name="selectedQuestion" 
//                     value={q}
//                     checked={selectedQuestion === q}
//                     onChange={() => setSelectedQuestion(q)} 
//                   />
//                   {q}
//                   <input 
//                     type="text" 
//                     placeholder="Enter a keyword..." 
//                     value={searchTerm} 
//                     onChange={e => setSearchTerm(e.target.value)} 
//                   />
//                   <button onClick={handleGetNewQuestions}>Get New Questions</button>

//                 </label>
//               ))}
//             </fieldset>
//           </div>
//         )}
        
//         {selectedQuestion && (
//           <div>
//             <h3>Recording Answer for:</h3>
//             <p>❓ <em>{selectedQuestion}</em></p>
//             <div>
//               {status !== "recording" ? (
//                 <button onClick={startRecording}>Start Recording</button>
//               ) : (
//                 <button onClick={stopRecording}>Stop Recording</button>
//               )}
//             </div>
//             {mediaBlobUrl && (
//               <div>
//                 <video src={mediaBlobUrl} controls></video>
//                 <p><a href={mediaBlobUrl} download={`APMC_Practice_${Date.now()}.webm`}>Download Recording</a></p>
//                 <label>
//                   <input 
//                     type="checkbox" 
//                     checked={postAnonymous} 
//                     onChange={e => setPostAnonymous(e.target.checked)} 
//                   />
//                   Post anonymously (do not attach my LinkedIn profile)
//                 </label>
//                 <button onClick={handleGenerateSummary}>
//                   Generate Summary Text
//                 </button>
//               </div>
//             )}
//             {summaryText && (
//               <article>
//                 <h4>Submission Summary:</h4>
//                 <p>
//                   {summaryText.split('\n').map((line, idx) => (
//                     <span key={idx}>
//                       {line}<br/>
//                     </span>
//                   ))}
//                 </p>
//               </article>
//             )}
//           </div>
//         )}
//       </main>
//     </>
//   );
// }

// export default App;


// {/* 
// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import apmcLogo from './assets/APMC.png'
// import viteLogo from '/vite.svg'
// import './App.css'
// import { useReactMediaRecorder } from "react-media-recorder";
// import questions from './pm_questions.json';

// function App() {
//   // State hooks for form inputs
//   const [profileURL, setProfileURL] = useState("");
//   const [companyType, setCompanyType] = useState("");
//   const [interviewType, setInterviewType] = useState("");
//   const [questions, setQuestions] = useState([]);
//   const [selectedQuestion, setSelectedQuestion] = useState("");
//   const {
//     status,
//     startRecording,
//     stopRecording,
//     mediaBlobUrl
//   } = useReactMediaRecorder({ video: true });
//   const [postAnonymous, setPostAnonymous] = useState(false);
//   const [summaryText, setSummaryText] = useState("");
//   const handleGenerateSummary = () => {
//     let summary = "";
//     if (postAnonymous) {
//       summary += `An **anonymous** PM candidate answered:\n"${selectedQuestion}".\n`;
//     } else {
//       // Use profile URL or a generic label if not provided
//       summary += `**${profileURL || "A PM candidate"}** answered:\n"${selectedQuestion}".\n`;
//     }
//     // Add context information
//     summary += `_Interview Type_: ${interviewType || "N/A"}, _Company Type_: ${companyType || "N/A"}.\n`;
//     summary += "Thank you for listening to my practice response!";
//     setSummaryText(summary);
//   };

//   const handleGetQuestions = () => {
//     // Simple logic to generate questions based on inputs
//     let suggested = [];
//     if (interviewType === "Product Sense") {
//       suggested = [
//         `How would you improve a product from a ${companyType} company?`,
//         "What is your favorite product and how would you improve it?"
//       ];
//     } else if (interviewType === "Estimation") {
//       suggested = [
//         "Estimate the market size for ride-sharing services in your city.",
//         "How many people order takeout in New York on a Friday night?"
//       ];
//     } else if (interviewType === "Behavioral") {
//       suggested = [
//         "Tell me about a time you had to work with a difficult team member.",
//         "Describe a project you led that didn’t go as planned. What did you learn?"
//       ];
//     } else {
//       // Fallback questions if type is not selected or unrecognized
//       suggested = [
//         "Why do you want to be a product manager at our company?",
//         "Tell me about a product you admire and why."
//       ];
//     }
//     setQuestions(suggested);
//   };

  

//   // ... (we'll add more state hooks later for questions, recording, etc.)
//   const [count, setCount] = useState(0)

//   return (
    
//     <>
//     <div>
//         <a href="https://www.linkedin.com/company/theapmclub/" target="_blank">
//           <img src={apmcLogo} className="logo apmc" alt="APM Club logo" />
//         </a>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//     <main className="container">
//     <h2>🎥 APM Club Interview Practice Booth</h2>
//     <form onSubmit={(e) => { e.preventDefault(); handleGetQuestions(); }}>
//       <fieldset>
//         <label htmlFor="profile-url">LinkedIn Profile URL</label>
//         <input 
//           type="url"
//           id="profile-url"
//           placeholder="https://www.linkedin.com/in/your-profile"
//           value={profileURL}
//           onChange={e => setProfileURL(e.target.value)}
//           required
//         />
//       </fieldset>

//       <fieldset>
//         <label htmlFor="company-type">Company Type</label>
//         <input 
//           type="text"
//           id="company-type"
//           placeholder="e.g. Big Tech, Startup, Fintech..."
//           value={companyType}
//           onChange={e => setCompanyType(e.target.value)}
//           required
//         />
//       </fieldset>

//       <fieldset>
//         <label htmlFor="interview-type">Interview Prep Type</label>
//         <select 
//           id="interview-type"
//           value={interviewType}
//           onChange={e => setInterviewType(e.target.value)}
//           required
//         >
//           <option value="">-- Select Interview Type --</option>
//           <option value="Product Sense">Product Sense</option>
//           <option value="Estimation">Analytical Thinking/Estimation</option>
//           <option value="Behavioral">Behavioral</option>
//         </select>
//       </fieldset>

//       <fieldset>
//         <label>
//           Areas you lack practice in:
//           <input 
//             type="text" 
//             value={weakAreas} 
//             onChange={e => setWeakAreas(e.target.value)} 
//             placeholder="E.g. metrics, A/B testing, leadership..." 
//             required 
//           />
//         </label>
//       </fieldset>
      
//       <button type="submit">Get Practice Questions</button>
//     </form>
//     {questions.length > 0 && (
//       <div>
//         <h3>Suggested Questions:</h3>
//         <fieldset>
//           <legend>Suggested Questions:</legend>
//           {questions.map((q, index) => (
//             <label key={index}>
//               <input 
//                 type="radio" 
//                 name="selectedQuestion" 
//                 value={q}
//                 checked={selectedQuestion === q}
//                 onChange={() => setSelectedQuestion(q)} 
//               />
//               {q}
//             </label>
//           ))}
//         </fieldset>
//       </div>
//     )}
//     {selectedQuestion && (
//       <div>
//         <h3>Recording Answer for:</h3>
//         <p>❓ <em>{selectedQuestion}</em></p>
//         <div>
//           {status !== "recording" ? (
//             <button onClick={startRecording}>Start Recording</button>
//           ) : (
//             <button onClick={stopRecording}>Stop Recording</button>
//           )}
//         </div>
//         {mediaBlobUrl && (
//           <div>
//             <video src={mediaBlobUrl} controls></video>
//             <p><a href={mediaBlobUrl} download={`APMC_Practice_${Date.now()}.webm`}>Download Recording</a></p>
//             <label>
//               <input 
//                 type="checkbox" 
//                 checked={postAnonymous} 
//                 onChange={e => setPostAnonymous(e.target.checked)} 
//               />
//               Post anonymously (do not attach my LinkedIn profile)
//             </label>
//             {/*<button onClick={handleGenerateSummary}>
//               Generate Summary Text
//             </button>
//           </div>
//         )}
//         {summaryText && (
//           <article>
//             <h4>Submission Summary:</h4>
//             <p>
//               {summaryText.split('\n').map((line, idx) => (
//                 <React.Fragment key={idx}>
//                   {line}<br/>
//                 </React.Fragment>
//               ))}
//             </p>
//           </article>
//         )
//       </div>
//     )}
//   </main>
//     </>
//   )
// }

// export default App
// */}
