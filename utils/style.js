const globalStyle = (darkMode) => {
  const green = '#188050';
  const dark = '#30404d';
  const bright = '#f5f5f5';
  return <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
        .container, .chart-container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: ${darkMode ? dark : bright};
          color: ${darkMode ? bright : dark};
        }
        .chart-container {
          justify-content: flex-start;
          padding-top: 120px;
        }
        .navbar {
          width: 100%;
          height: 40px;
          position: fixed;
          left: 0;
          top: 0;
          background: ${green};
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-right: 5%;
          color: ${bright};
        }
        .navbar-elements {
          cursor: pointer;
          margin: 0 15px;
          ${!darkMode ? 'filter: invert(1);' : ''}
        }
        .navbar-elements:hover {
          filter: opacity(0.5);
        }
        .navbar-tooltip {
          top: 50px;
        }
        .button-signin {
          width: 100px;
          height: 100px;
          cursor: pointer;
          animation: 5s infinite throb;
        }
        @keyframes throb {
          0% { transform: scale(1); }
          40% { transform: scale(1); }
          45% { transform: scale(1.2); }
          50% { transform: scale(1); }
          55% { transform: scale(1.2); }
          60% { transform: scale(1); }
          100% { transform: scale(1); }
        }
        .button-signin:hover {
          filter: opacity(0.5);
        }
        .dialog-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px 30px 0;
        }
        .form-input-group {
          margin: 10px 0;
        }
        .bp3-input {
          width: 200px !important;
          text-align: right;
        }
        .labels {
          font-weight: 600;
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select:none;
          user-select:none;
          -o-user-select:none; 
        }
        .btn-submit, .bp3-html-select {
          width: 200px;
          height: 40px;
        }
        .btn-submit {
          margin-top: 10px;
        }
        .space-around {
          display: flex;
          justify-content: space-around;
          align-items: center;
        }
        #memo {
          text-align: left;
        }
        .icon-filter:hover {
          animation: shake 0.92s;
        }
        @keyframes shake {
          10%, 90% {
            transform: translate3d(-1px, 0, 0);
          }
          20%, 80% {
            transform: translate3d(2px, 0, 0);
          }
          30%, 50%, 70% {
            transform: translate3d(-4px, 0, 0);
          }
          40%, 60% {
            transform: translate3d(4px, 0, 0);
          }
        }
        .bp3-overlay-backdrop {
          background-color: rgba(16, 22, 26, 0.9);
        }
        .overlay {
          width: 50%;
          height: 70%;
          position: fixed;
          left: 25%;
          top: 15%;
          color: #f5f5f5;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .overlay-btn-container {
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          width: 40%;
          margin-top: 40px;
        }
        .overlay-select-container {
          display: flex;
          margin-bottom: 10px;
        }
        .overlay-select-buttons {
          margin-left: 10px;
        }
        .overlay-checkboxes {
          height: 85%;
          overflow-y: scroll;
          padding: 5px;
        }
        @media only screen and (max-width: 500px) {
          .overlay {
            width: 100%;
            height: 80%;
            left: 0;
            top: 10%;
          }
          .overlay-btn-container {
            width: 50%;
          }
          .overlay-select-container {
            height: 30%;
            flex-direction: column;
          }
          .overlay-select-buttons {
            margin-left: 0;
            margin-top: 10px;
          }
          .overlay-checkboxes {
            height: 70%;
            margin-top: 20px;
          }
        }
        .back-to-top {
          position: sticky;
          top: 90%;
          left: 100%;
          border: 1px solid #fff;
          border-radius: 50%;
          padding: 3px;
          cursor: pointer;
          z-index: 20;
        }
        .back-to-top:hover {
          filter: opacity(0.5);
        }
        .spreadsheet {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: fill-available;
          display: flex;
          justify-content: center;
          padding: 40px 0 0;
        }
        .spreadsheet-chart-title {
          font-size: 30px;
          text-align: center;
          letter-spacing: 5px;
          width: 100%;
          background: transparent;
          color: #182026;
          padding: 10px;
        }
        .round-button {
          border-radius: 50%;
        }
        .round-button:hover {
          filter: opacity(0.5);
        }
        .viewMode-indicator {
          padding: 5px;
          border: 10px solid;
          border-radius: 50%;
        }
        .total-cell {
          background: #787878;
          color: #f5f5f5;
          font-weight: bold;
        }
        .button-cell {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .button-update {
          width: 100px;
          transform: scale(0.7);
        }
      `}</style>
}

export default globalStyle;