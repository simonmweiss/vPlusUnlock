window.addEventListener('DOMContentLoaded', function () {
    var externalPostDataNode = document.getElementById("externalPostDataNode")
    if (externalPostDataNode) {
        unlockVPlus(externalPostDataNode);
    }
    addComments();
})

function unlockVPlus(externalPostDataNode) {
    var content = JSON.parse(externalPostDataNode.innerHTML);
    var blocks = content.content.data.post.blocks;
    var paywallPos = calculatePaywallPosition(content.paywall_position, blocks);
    var paywalledBlocks = blocks.slice(paywallPos);
    var paywalledContent = document.getElementsByClassName("paywalled-content")[0];

    for (const block of paywalledBlocks) {
        if (block.t == "DCXImage") {
            var picDetails = JSON.parse(block.a[0].value)[0];
            let div = document.createElement('div');
            div.classList.add('entry-content');
            div.classList.add('dcx-image');
            let figure = document.createElement('figure');
            figure.classList.add('wp-block-image');
            figure.classList.add('relative');
            figure.innerHTML = getFigureHtml(picDetails);
            div.appendChild(figure);
            paywalledContent.appendChild(div);
        } else if (block.t == "HtmlBlock") {
            let div = document.createElement('div');
            div.classList.add('entry-content');
            div.innerHTML = block.h;
            paywalledContent.appendChild(div);
        }
    }
}

function getFigureHtml(picDetails) {
    return "<img src=\"" + picDetails.img + "\" alt=\"" + escape(picDetails.caption) + "\" sizes=\"50vw\" srcset=\"" + picDetails.srcset + "\" class=\"wp-image-" + picDetails.id + "\"><figcaption>" + picDetails.caption + "</figcaption>";
}

function calculatePaywallPosition(paywallPosition, blocks) {
    let removeContent = false,
        result = 4;

    visibleBlocks = blocks.filter(function (block) {
        if ('Author' === block.t) {
            return block;
        }

        let content = block.h;
        if (content.match(/russmedia-nordstern-lead/i)) {
            removeContent = true;
            return block;
        }

        if (removeContent) {
            return;
        }

        return block;
    });

    if (!removeContent) {
        return result;
    }

    result = visibleBlocks.length + paywallPosition;
    return result;
}

function addComments() {
    var commentElement = document.getElementById("comments");
    commentElement.parentElement.hidden = false;
    var commentsWrapper = commentElement.children[1].children[0];
    var comments = commentsWrapper.children[2];
    commentsWrapper.children[1].remove();
    comments.children[1].remove();
    comments.children[0].remove();
    var postId = window.location.href.split('/')[4];
    console.log(postId)
    fetch("https://www.vol.at/api/nnp/get_forum?p=" + postId)
        .then((response) => response.json())
        .then((json) => {
            var commentsString = "";
            json.comments.forEach(comment => {
                commentsString += getCommentTemplate(comment);
            });
            comments.innerHTML = commentsString;
        });

}

function getCommentTemplate(comment) {
    var commentString =
        `<div id="comment-${comment.id}" class="flex flex-col gap-y-10">
        <div class="flex flex-col gap-4 ${comment.depth > 1 ? `md:ml-${10 * (comment.depth - 1)} ml-${4 * (comment.depth - 1)}` : ""}">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="flex items-center justify-center w-10 h-10 rounded-full" data-testid="user-image" style="background: rgb(70, 255, 200);">
                        <span class="mb-[4px] typo-artikel-sub" style="color: rgb(54, 36, 255);">${comment.author.author.substring(0, 1).toUpperCase()}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="flex items-center gap-2 typo-kommentar-user">${comment.author.author}</span>
                        <span class="typo-kommentar-zeitangabe text-grau-600" title="${comment.date}">${comment.date}</span>
                    </div>
                </div>
            </div>
            <span class="break-words typo-basics-1">${comment.content}</span>
        </div>`;
    if (comment.elements) {
        for (let index = 0; index < comment.elements.length; index++) {
            commentString += getCommentTemplate(comment.elements[index]);
        }
    }
    commentString += "</div>";
    return commentString;
}
