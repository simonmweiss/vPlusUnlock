var content = JSON.parse(document.getElementById("externalPostDataNode").innerHTML);
var blocks = content.content.data.post.blocks;
var paywallPos = calculatePaywallPosition(content.paywall_position, blocks);
var paywalledBlocks = blocks.slice(paywallPos);
var paywalledContent = document.getElementsByClassName("paywalled-content")[0];
console.log(paywallPos);
console.log(paywalledBlocks);
for (const block of paywalledBlocks){
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

function getFigureHtml(picDetails) {
    return "<img src=\""+picDetails.img+"\" alt=\""+escape(picDetails.caption)+"\" sizes=\"50vw\" srcset=\""+picDetails.srcset+"\" class=\"wp-image-"+picDetails.id+"\"><figcaption>"+picDetails.caption+"</figcaption>";
}

function calculatePaywallPosition(paywallPosition, blocks) {
    let removeContent = false,
        result = 4;

    visibleBlocks = blocks.filter(function(block) {
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
