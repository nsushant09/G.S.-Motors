const carNameInput = document.getElementById("carName");
    const carPriceInput = document.getElementById("carPrice");
    const carImagesInput = document.getElementById("carImages");
    const output = document.getElementById("output");

    // Live preview updates
    const previewName = document.getElementById("previewName");
    const previewPrice = document.getElementById("previewPrice");
    const previewImg = document.getElementById("previewImg");

    carNameInput.addEventListener("input", () => {
      previewName.textContent = carNameInput.value;
    });

    carPriceInput.addEventListener("input", () => {
      previewPrice.textContent = carPriceInput.value;
    });

    carImagesInput.addEventListener("change", () => {
      output.innerHTML = ""; // clear previous
      const files = Array.from(carImagesInput.files);

      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const container = document.createElement("div");
          container.style.marginBottom = "30px";

          // Template
          const template = document.createElement("div");
          template.className = "template";
          template.id = `template-${index}`;

          template.innerHTML = `
            <div class="logo">GS</div>
            <div class="price-box">${carPriceInput.value}</div>
            <div class="car-name">${carNameInput.value}</div>
            <img class="car-image" src="${e.target.result}" />
            <div class="ellipse"></div>
            <div class="footer">
              +977 9851036706 | +977 9823579122 | +977 9843912013 <br/>
              Karkhana Chowk, Swoyambhu, Kathmandu <br/>
              www.gsmotors.com
            </div>
          `;

          // Download button
          const btn = document.createElement("button");
          btn.innerText = "Download";
          btn.className = "download-btn";
          btn.onclick = () => {
            html2canvas(template, {width:1080, height:1080}).then(canvas => {
              const link = document.createElement("a");
              link.download = `${carNameInput.value}-${index+1}.png`;
              link.href = canvas.toDataURL();
              link.click();
            });
          };

          container.appendChild(template);
          container.appendChild(btn);
          output.appendChild(container);

          // Update live preview with first uploaded image
          if (index === 0) {
            previewImg.src = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      });
    });