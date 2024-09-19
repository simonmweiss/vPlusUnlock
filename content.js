var externalPostDataNode = document.getElementById("externalPostDataNode")
if (externalPostDataNode) {
    unlockVPlus(externalPostDataNode);
}
addComments();

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
    try {
        var commentElement = document.getElementById("comments");
        commentElement.parentElement.hidden = false;
        var commentsWrapper = commentElement.children[1].children[0];
        if (commentsBlocked(commentsWrapper)) {
            addCommentsElement(commentsWrapper);
        }
        var comments = commentsWrapper.children[2];
        commentsWrapper.children[1].remove();
        if (comments.children[1]) {
            comments.children[1].remove();
        }
        if (comments.children[0]) {
            comments.children[0].remove();
        }
        var postId = window.location.href.split('/')[4];
        fetch("https://www.vol.at/api/nnp/get_forum?p=" + postId + "&rnd=1")
            .then((response) => response.json())
            .then((json) => {
                var commentsString = "";
                json.comments.forEach(comment => {
                    commentsString += getCommentTemplate(comment);
                });
                comments.innerHTML = commentsString;
            });
    } catch (error) {
        setTimeout(addComments, 3000);
    }
}

function commentsBlocked(commentsWrapper) {
    if (commentsWrapper.innerHTML.includes('Die Kommentarsektion ist für diesen Artikel geschlossen.')) {
        if (!commentsWrapper.innerHTML.includes('V+ Unlock')) {
            commentsWrapper.children[0].children[1].innerHTML += ' Mit V+ Unlock können Sie die bisher verfassten Kommentare trotzdem lesen:';
        }
        return true;
    }
    return false;
}

function addCommentsElement(commentsWrapper) {
    commentsWrapper.appendChild(document.createElement("div"));
    var newComments = document.createElement("div");
    newComments.classList.add("flex");
    newComments.classList.add("flex-col");
    newComments.classList.add("mt-12");
    newComments.classList.add("gap-y-10");
    commentsWrapper.appendChild(newComments);
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
            <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                    <div class="flex items-center gap-2" data-testid="answer-button"></div>
                    <div class="flex gap-x-2">
                        <div class="inline-flex flex-row items-center gap-1 p-2 border rounded-lg border-grau-500 bg-white">
                            <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="upvote-button" data-tee-event-data="{&quot;method&quot;:&quot;log&quot;,&quot;step&quot;:&quot;O3kEq2ZUFkIGTTcY98lfef815G475SRmI1xwtDQ2&quot;,&quot;featured&quot;:false,&quot;data&quot;:{&quot;id&quot;:&quot;8950498&quot;,&quot;url&quot;:&quot;vorarlberg-hilft-in-niederosterreich-die-ankunft-im-katastrophengebiet/8950498&quot;,&quot;voted&quot;:&quot;up&quot;}}"><g id="Global / Icons"><path id="Icon_Like" fill-rule="evenodd" clip-rule="evenodd" d="M7.9605 4.11881H10.7317C11.5061 4.11881 11.9995 4.69081 11.9995 5.65469V7.46969C11.9995 9.64287 11.2259 11 9.90871 11H5.46314C4.78832 11 4.29492 10.5751 4.29492 10.5751V4.10712C5.37702 3.96825 6.20218 2.48256 6.38571 1.1385C6.49229 0.367812 6.87911 0 7.4551 0C8.0318 0 8.54144 0.37675 8.54144 1.17906V1.86381C8.54144 2.54994 8.38897 3.57431 7.9605 4.11881ZM2.63431 4.11906C2.69007 4.11906 2.74442 4.11425 2.79877 4.10738V10.5747C2.79877 10.5747 2.75713 10.9996 2.09079 10.9996H0.776457C0.347288 10.9996 0 10.6538 0 10.2282V4.87394C0 4.44838 0.347288 4.10325 0.776457 4.10325C1.53386 4.10325 2.63431 4.11906 2.63431 4.11906Z" fill="black"></path></g></svg>
                            <span class="typo-basics-1-bold">${comment.meta.rating.positive}</span>
                        </div>
                        <div class="inline-flex flex-row items-center gap-1 p-2 border rounded-lg border-grau-500 bg-white">
                            <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg" data-testid="downvote-button" data-tee-event-data="{&quot;method&quot;:&quot;log&quot;,&quot;step&quot;:&quot;KmOllgpi1F26BhLRmjJu4FsFOirDR1nzNUSa5322&quot;,&quot;featured&quot;:false,&quot;data&quot;:{&quot;id&quot;:&quot;8950498&quot;,&quot;url&quot;:&quot;vorarlberg-hilft-in-niederosterreich-die-ankunft-im-katastrophengebiet/8950498&quot;,&quot;voted&quot;:&quot;down&quot;}}"><g id="Global / Icons"><path id="Icon_Like" fill-rule="evenodd" clip-rule="evenodd" d="M7.96112 6.88119H10.7324C11.5067 6.88119 12.0001 6.30919 12.0001 5.34531V3.53031C12.0001 1.35713 11.2265 0 9.90932 0H5.46375C4.78894 0 4.29554 0.424875 4.29554 0.424875V6.89288C5.37763 7.03175 6.2028 8.51744 6.38632 9.8615C6.49291 10.6322 6.87973 11 7.45572 11C8.03241 11 8.54205 10.6233 8.54205 9.82094V9.13619C8.54205 8.45006 8.38958 7.42569 7.96112 6.88119ZM2.63431 6.88101C2.69007 6.88101 2.74442 6.88582 2.79877 6.89269V0.425383C2.79877 0.425383 2.75713 0.000507355 2.09079 0.000507355H0.776457C0.347288 0.000507355 0 0.34632 0 0.771882V6.12613C0 6.55169 0.347288 6.89682 0.776457 6.89682C1.53386 6.89682 2.63431 6.88101 2.63431 6.88101Z" fill="black"></path></g></svg>
                            <span class="typo-basics-1-bold">${comment.meta.rating.negative}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    if (comment.elements) {
        for (let index = 0; index < comment.elements.length; index++) {
            commentString += getCommentTemplate(comment.elements[index]);
        }
    }
    commentString += "</div>";
    return commentString;
}
