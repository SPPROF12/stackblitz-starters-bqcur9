document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("chatbot-form");
    const responseContainer = document.getElementById("response-container");
    const workerUrl = "https://moi.sp12.workers.dev/"; // Cloudflare Worker URL
    const facts = [];
    let factIndex = 0;
    let factInterval;
  
    async function loadFacts() {
      try {
        const response = await fetch("https://raw.githubusercontent.com/sp12102001/facts.txt/main/facts.txt");
        const text = await response.text();
        facts = text.split("\n").filter((fact) => fact.trim() !== "");
      } catch (error) {
        console.error("Error loading facts:", error);
      }
    }
  
    function showLoading() {
      responseContainer.innerHTML = `<span class="loading-bold">Loading... Here are some facts about Sanjana while you wait:</span><br><span id="fact-container">Please wait...</span>`;
      factInterval = setInterval(() => {
        factIndex = (factIndex + 1) % facts.length;
        const factContainer = document.getElementById("fact-container");
        factContainer.textContent = facts[factIndex];
      }, 2000);
    }
  
    function stopLoading() {
      clearInterval(factInterval);
    }
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const question = document.getElementById("question").value;
      responseContainer.innerHTML = `<span class="loading-bold">Loading... Here are some facts about Sanjana while you wait:</span><br><span id="fact-container"></span>`;
      showLoading();
      try {
        const response = await fetch(workerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const responseData = await response.json();
        stopLoading();
        responseContainer.textContent = responseData.output ? responseData.output : "No answer available.";
      } catch (error) {
        stopLoading();
        if (error.message.includes("Failed to fetch")) {
          responseContainer.textContent = "Failed to fetch response. Please ensure third-party cookies are enabled in your browser settings.";
        } else {
          responseContainer.textContent = `Unexpected error: ${error.message}`;
        }
      }
    });
  
    // Load facts on page load
    loadFacts();
  });