(function () {
  const WIDGET_HOST = "http://5.223.65.178:3001";
  //const WIDGET_HOST = "http://localhost:3001"; // For local development

  function renderWidget(testimonials) {
    const widgetContainer = document.getElementById("testimonial-widget");
    if (!widgetContainer) {
      console.error("Widget container not found");
      return;
    }

    // Inject some basic styles
    const style = document.createElement("style");
    style.innerHTML = `
            .testimonial-card-widget { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 16px; font-family: sans-serif; }
            .testimonial-card-widget p { font-style: italic; }
            .testimonial-card-widget strong { font-style: normal; }
        `;
    document.head.appendChild(style);

    // Render testimonials
    testimonials.forEach((t) => {
      const card = document.createElement("div");
      card.className = "testimonial-card-widget";

      t.answers.forEach((a) => {
        const questionEl = document.createElement("strong");
        questionEl.textContent = a.question;
        const answerEl = document.createElement("p");
        answerEl.textContent = `"${a.answer}"`;
        card.appendChild(questionEl);
        card.appendChild(answerEl);
      });
      widgetContainer.appendChild(card);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch(`${WIDGET_HOST}/api/testimonials/widget`);
      if (!response.ok) {
        throw new Error("Failed to fetch testimonials for widget");
      }
      const testimonials = await response.json();
      renderWidget(testimonials);
      console.log("Testimonials widget rendered successfully.");
    } catch (error) {
      console.error("Error fetching testimonials for widget:", error);
    }
  });
})();
