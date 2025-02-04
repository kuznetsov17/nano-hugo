window.addEventListener("load", () => {
 // Retrieve all help sections
 
 const sections =  Array.from(document.querySelectorAll("h2, h3"));
 const scrollHandler = entries =>
  entries.forEach(entry => {
   const section = entry.target;
   const sectionId = section.id
//    console.log(sectionId)
   const sectionLink = document.querySelector(`a[href="#${sectionId}"]`);

   if (entry.intersectionRatio > 0) {
    section.classList.add("contrast");
    sectionLink.classList.add("contrast");
   } else {
    section.classList.remove("contrast");
    sectionLink.classList.remove("contrast");
   }
  });

 // Creates a new scroll observer
 const observer = new IntersectionObserver(scrollHandler);

 //noinspection JSCheckFunctionSignatures
 sections.forEach(section => observer.observe(section));
});
