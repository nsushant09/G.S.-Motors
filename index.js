const carNameInput = document.getElementById("carName");
const carPriceInput = document.getElementById("carPrice");
const carImagesInput = document.getElementById("carImages");
const output = document.getElementById("output");
const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", () => {
    const files = Array.from(carImagesInput.files);
    if (files.length === 0) {
        alert("Please select at least one image.");
        return;
    }

    output.innerHTML = ""; // Clear previous templates

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const container = document.createElement("div");
            container.className = "flex flex-col"
            container.style.marginBottom = "30px";

            // Template
            const template = document.createElement("div");
            template.className = "template flex flex-col";
            template.id = `template-${index}`;


            template.innerHTML = `
              <div class="header flex flex-row ml-[32px] mt-[24px]">
            <img src="./assets/logo_dark.png" class="w-[180px] h-auto" />

            <div
                class="detail-container flex flex-row bg-[#03624cf2] h-auto rounded-tl-[48px] rounded-bl-[8px] mt-[24px] ml-[64px] items-center w-full justify-between">
                <div class="name-container flex-1 flex-col justify-center items-center">
                    <div class="flex flex-col w-auto justify-center items-center">
                        <div class="font-[Podkova] text-[32px] tracking-[0.1em] text-[#fffbdf]">
                            BUY, SELL AND EXCHANGE
                        </div>
                        <div class="font-['Playfair_Display_SC'] text-[54px] tracking-[0.1em] text-[#fffbdf]">
                        ${carNameInput.value}
                        </div>
                    </div>

                </div>

                <div
                    class="amount-container flex flex-col bg-[#fffbdfcc] h-full rounded-tl-[48px] rounded-bl-[8px] min-w-[200px] justify-center items-center px-4">
                    <div id="amount" class="font-[Donatto] text-[48px] text-[#03624cf2] tracking-[0.1em]">${carPriceInput.value}</div>
                    <div id="lakhs" class="font-[Donatto] text-[24px] text-[#03624cf2]">lakhs</div>
                </div>
            </div>

        </div>

        <div class="car-image mt-[48px]">
            <img id="car-image" src="${e.target.result}" class="w-full h-full object-cover block" />
        </div>
        <div class="ellipse"></div>
        <div class="footer flex flex-col items-center">
            <div id="contacts" class="font-[Podkova] text-[24px] text-[#03624c] tracking-[0.1em]">
                +977 9851035706 | +977 9823579122 | +977 9843912013
            </div>
            <div id="address" class="font-[Podkova] text-[24px] text-[#03624c] tracking-[0.1em]">
                Karkhana Chowk, Swoyambhu, Kathmandu
            </div>
            <div id="contacts" class="font-[Podkova] text-[24px] text-[#03624c] tracking-[0.1em]">
                www.gsmotors.com
            </div>
        </div>
      `

            container.appendChild(template);
            output.appendChild(container);
        };
        reader.readAsDataURL(file);
    });

    // Create single download button at the end
    setTimeout(() => { // wait for all images to load
        const downloadBtn = document.createElement("button");
        downloadBtn.innerText = "Download All";
        downloadBtn.className = "download-btn mt-4";
        downloadBtn.onclick = () => {
            const templates = document.querySelectorAll(".template");
            templates.forEach((template, idx) => {
                html2canvas(template, { width: 1080, height: 1080 }).then(canvas => {
                    const link = document.createElement("a");
                    link.download = `${carNameInput.value}-${idx + 1}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                });
            });
        };
        output.appendChild(downloadBtn);
    }, 500); // small delay to ensure templates are appended
});
