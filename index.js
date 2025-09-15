const carNameInput = document.getElementById("carName");
const carPriceInput = document.getElementById("carPrice");
const carImagesInput = document.getElementById("carImages");
const output = document.getElementById("output");
const generateBtn = document.getElementById("generateBtn");
const carNameFontSizeInput = document.getElementById("carNameFontSize");


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
            // Create image element
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                // Create a temporary canvas to crop/resize
                const canvas = document.createElement("canvas");
                canvas.width = 1080;
                canvas.height = 600;
                const ctx = canvas.getContext("2d");

                // Calculate scale to cover canvas without stretching
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width / 2) - (img.width / 2) * scale;
                const y = (canvas.height / 2) - (img.height / 2) * scale;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                // Get cropped image as data URL
                const croppedDataURL = canvas.toDataURL();

                // Now use croppedDataURL in your template
                const container = document.createElement("div");
                container.className = "flex flex-col";
                container.style.marginBottom = "30px";

                const template = document.createElement("div");
                template.className = "template flex flex-col";
                template.id = `template-${index}`;

                template.innerHTML = `
                    <div class="header flex flex-row ml-[36px] mt-[24px]">
                        <img src="./assets/logo_dark.png" class="w-[180px] h-auto" />
                        <div
                            class="detail-container flex flex-row bg-[#03624cf2] rounded-tl-[48px] rounded-bl-[8px] ml-[64px] items-center w-full justify-between">
                            <div class="name-container flex-1 flex-col">
                                <div class="flex flex-col items-center  justify-center mt-[-32px]">
                                    <div class="font-[Podkova] text-[32px] tracking-[0.1em] text-[#fffbdf]">
                                        BUY, SELL AND EXCHANGE
                                    </div>
                                    <div class="font-['Playfair_Display_SC'] text-[${carNameFontSizeInput.value}px] tracking-[0.1em] text-[#fffbdf]">
                                        ${carNameInput.value}
                                    </div>
                                </div>
                            </div>
                            <div
                                class="amount-container flex flex-col bg-[#fffbdfcc] h-full rounded-tl-[48px] rounded-bl-[8px] min-w-[200px]  items-center justify-center px-4">
                                <div id="amount" class="font-[Donatto] text-[48px] text-[#03624cf2] tracking-[0.1em] mt-[-24px]">${carPriceInput.value}</div>
                                <div id="lakhs" class="font-[Donatto] text-[24px] text-[#03624cf2]">lakhs</div>
                            </div>
                        </div>
                    </div>
                    <div class="car-image mt-[36px]">
                        <img id="car-image" src="${croppedDataURL}" class="w-full h-full object-cover block" />
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
                `;

                container.appendChild(template);
                output.appendChild(container);
            };
        };
        reader.readAsDataURL(file);
        carNameFontSizeInput.value = "54";
    });


    // Wait for fonts to load first
    setTimeout(() => { // small delay to ensure templates are appended
        const downloadBtn = document.createElement("button");
        downloadBtn.innerText = "Download All";
        downloadBtn.className = "download-btn mt-4";

        downloadBtn.onclick = () => {
            const templates = Array.from(document.querySelectorAll(".template"));

            templates.slice(1).forEach((template, idx) => {
                html2canvas(template, { width: 1080, height: 1080, scale: 2 }).then(canvas => {
                    const link = document.createElement("a");
                    link.download = `${carNameInput.value}-${idx + 1}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                });
            });
        };

        output.appendChild(downloadBtn);
    }, 500);
});


