export const errorHandler = (err) => {
  console.error("ERROR: " + err);
  const errHtml = document.createElement("div").className("error");
  errHtml.innerHTML = "An error occurred";
  document.getElementById("main").appendChild(errHtml);
  document.getElementById("main").innerHTML = "An error occurred";
};
