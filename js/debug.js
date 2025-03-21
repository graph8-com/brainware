console.log = (function(originalLog) {
  return function(text) {
    originalLog.call(console, text);
    fetch("http://localhost:8080/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ log: text })
    }).catch(err => {});
  };
})(console.log);
