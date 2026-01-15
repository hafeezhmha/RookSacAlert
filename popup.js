document.addEventListener("DOMContentLoaded", () => {
  displaySacrifices();
  loadSettings();

  const enableSoundCheckbox = document.getElementById("enableSound");
  enableSoundCheckbox.addEventListener("change", () => {
    chrome.storage.local.set({ enableSound: enableSoundCheckbox.checked });
  });
});

function displaySacrifices() {
  chrome.storage.local.get({ rookSacrifices: [] }, (result) => {
    const sacrifices = result.rookSacrifices;
    const container = document.getElementById("postsContainer");
    container.innerHTML = "";

    if (sacrifices.length === 0) {
      container.innerHTML = '<p class="empty-state">No rook sacrifices detected yet. Play some chess!</p>';
      return;
    }

    sacrifices.slice().reverse().slice(0, 10).forEach((sacrifice, index) => {
      const sacDiv = document.createElement("div");
      sacDiv.classList.add("post");

      const sacLink = document.createElement("a");
      sacLink.classList.add("postname");
      sacLink.href = sacrifice.url;
      sacLink.textContent = `${sacrifice.move} - ${new Date(sacrifice.timestamp).toLocaleString()}`;
      sacLink.target = "_blank";

      const removeButton = document.createElement("button");
      removeButton.className = "remove-button";

      const img = document.createElement("img");
      img.src = "icons/delete.png";
      img.alt = "Remove";

      removeButton.appendChild(img);
      removeButton.addEventListener("click", () => {
        removeSacrifice(sacrifices.length - 1 - index);
      });

      sacDiv.appendChild(sacLink);
      sacDiv.appendChild(removeButton);
      container.appendChild(sacDiv);
    });
  });
}

function removeSacrifice(index) {
  chrome.storage.local.get({ rookSacrifices: [] }, (result) => {
    const sacrifices = result.rookSacrifices;
    sacrifices.splice(index, 1);
    chrome.storage.local.set({ rookSacrifices: sacrifices }, () => {
      displaySacrifices();
    });
  });
}

function loadSettings() {
  chrome.storage.local.get({ enableSound: true }, (result) => {
    document.getElementById("enableSound").checked = result.enableSound;
  });
}

// Listen for messages from content script about new sacrifices
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "rookSacrificeDetected") {
    chrome.storage.local.get({ rookSacrifices: [] }, (result) => {
      const sacrifices = result.rookSacrifices;
      sacrifices.push({
        move: request.move,
        url: request.url,
        timestamp: Date.now()
      });
      chrome.storage.local.set({ rookSacrifices: sacrifices }, () => {
        displaySacrifices();
      });
    });
  }
});
