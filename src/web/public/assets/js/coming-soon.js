const comingSoon = document.querySelectorAll(".coming-soon");

comingSoon.forEach((element) => {
    element.addEventListener("mouseover", () => {
        alert(element.getAttribute("data-title"));
    });
});