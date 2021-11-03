import { userAcc } from "../Stores";
import { get } from 'svelte/store';
import { errMessage, successMessage } from "../../Forms/messages";

function NewsDisplay(element) {

    const userAcc_News = get(userAcc);

    let mainDiv = document.createElement("div");
    document.getElementById("newsBody").prepend(mainDiv);
    AddStyleToMain(mainDiv);

    let span = document.createElement("span");
    mainDiv.appendChild(span);
    spanStyle(span);

    let newsText = document.createElement("h3");
    newsText.innerHTML = element.newsText;
    mainDiv.appendChild(newsText);
    newsTextStyle(newsText);

    let newsHeader = document.createElement("h2");
    newsHeader.innerHTML = element.newsHeader;
    span.appendChild(newsHeader);
    newsHeaderStyle(newsHeader);

    let newDate = document.createElement("h3");
    newDate.innerHTML = element.newsPostingDate;
    newsHeader.appendChild(newDate);
    newDateStyle(newDate);

    let newsPostedBy = document.createElement("h5");
    newsPostedBy.innerHTML = "posted by " + element.authorName;
    mainDiv.appendChild(newsPostedBy);
    newsPostedByStyle(newsPostedBy);

    if (userAcc_News.userID == element.authorID) {
        let newsDeleteButton = document.createElement("button");
        mainDiv.appendChild(newsDeleteButton);
        newsDeleteButton.innerHTML = "Delete";
        newsDeleteButtonStyle(newsDeleteButton);

        newsDeleteButton.value = element._id;
        newsDeleteButton.onclick = async () => {
            await fetch("http://localhost:5000/newsDelete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    newsID: newsDeleteButton.value,
                    userID: userAcc_News.userID
                })
            })
            .then( response => response.json() )
            .then( data => successMessage( data ) );

            mainDiv.remove();
        };
    }
}


function AddStyleToMain(element) {
    element.style.width = "70%";
    element.style.height = "auto";
    element.style.margin = "0";
    element.style.marginTop = "100px";
    element.style.marginLeft = "auto";
    element.style.marginRight = "auto";
    element.style.padding = "0";
    element.style.paddingBottom = "5px";
    element.style.backgroundColor = "white";
    element.style.maxWidth = "1000px";
}


function spanStyle(element) {
    element.style.paddingBottom = "5px";
    element.style.width = "100%";
    element.style.height = "auto";
    element.style.backgroundColor = "teal";
    element.style.display = "grid";
}


function newsHeaderStyle(element) {
    element.style.margin = "0";
    element.style.marginTop = "5px";
    element.style.marginLeft = "10px";
    element.style.marginRight = "10px";
    element.style.color = "white";
    element.style.fontSize = "20px";
    element.style.display = "grid";
}

function newDateStyle(element) {
    element.style.margin = "0";
    element.style.marginRight = "10px";
    element.style.marginLeft = "auto";
    element.style.marginTop = "2px";
    element.style.padding = "0";
    element.style.fontSize = "10px";
    element.style.color = "white";
    element.style.display = "grid";
    element.style.float = "right";
}

function newsTextStyle(element) {
    element.style.margin = "0";
    element.style.marginLeft = "10px";
    element.style.marginRight = "10px";
    element.style.marginTop = "10px"
    element.style.fontWeight = "400";
    element.style.fontSize = "15px";
    element.style.textIndent = "10px";
}

function newsPostedByStyle(element) {
    element.style.margin = "0";
    element.style.marginTop = "20px";
    element.style.marginLeft = "10px";
    element.style.padding = "0";
}

function newsDeleteButtonStyle(element) {
    element.style.float = "right";
    element.style.margin = "0";
    element.style.marginTop = "10px";
    element.style.width = "20%";
    element.style.color = "white";
    element.style.backgroundColor = "rgb(128,0,0)";
    element.style.fontWeight = "500";

}

export { NewsDisplay };