class EmailSidekickBanner {
  constructor(id) {
    this.banner = document.createElement('div');
    this.banner.className = 'email-sidekick-banner';
    this.banner.id = id;
    this.banner.appendChild(document.createElement('style')).textContent = `
      .email-sidekick-banner {
        z-index: 9999998;
        position: fixed;
        width: 100%;
        bottom: 0;
        left: 0;
        font-family: Arial, sans-serif;
        font-size: 1rem;
        background-color: red;
        color: white;
        padding: 0 20px;
      }
      .email-sidekick-banner a:any-link {
        color: white;
      }
      .email-sidekick-banner input,
      .email-sidekick-banner button {
        font-family: Arial, sans-serif;
        font-size: 1rem;
        background: transparent;
        color: white;
      }
      .email-sidekick-banner input {
        outline: none;
        border: none;
        width: 400px;
        text-overflow: ellipsis;
      }
      .email-sidekick-banner button {
        border: solid 1px white;
        border-radius: 8px;
        padding: 5px 8px;
        margin-left: 5px;
        user-selection: none;
        cursor: pointer;
      }`;
    this.bannerContent = this.banner.appendChild(document.createElement('p'));
    this.bannerContent.className = 'content';
    document.body.prepend(this.banner);
  }

  querySelector(selector) {
    return this.bannerContent.querySelector(selector);
  }

  write(content, timeout) {
    this.bannerContent.innerHTML = content;
    if (timeout) {
      this.hide(timeout);
    }
  }


  hide(timeout = 0) {
    setTimeout(() => {
      this.banner.remove();
    }, timeout * 1000);
  }
}

const copyHtml = () => {
  const iframe = document.getElementById('__emailFrame');
  if (iframe) {
    navigator.clipboard.writeText(iframe.srcdoc).then(() => {
    });
  }
};

const sendHtml = () =>
{
  const html = copyHtml();
  const url = 'https://campeng-mkt-prod1.campaign.adobe.com/nms/amcCreateDelivery.jssp';

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `template=mail&htmlContent=${html}`,
    credentials: 'include'
  };

  window.fetch(url, requestOptions)
      .then(response => {
        if (response.ok) {
          return response.text();
        } else {
          throw new Error('Request failed with status: ' + response.status);
        }
      })
      .then(data => {
        console.log(data); // Process the response data here
      })
      .catch(error => {
        console.error('Error:', error);
      });
}

const downloadHtml = () => {
  const iframe = document.getElementById('__emailFrame');
  if (iframe) {
    const h1 = iframe.contentWindow.document.body.querySelector('h1');
    const title = h1 ? h1.innerText : 'New E-Mail';
    const subject = `Subject: ${title}`;
    const to = 'To: noreply@adobe.com';
    const html = iframe.srcdoc;
    const fileName = title
            .replaceAll(/\W+/g, '-')
            .replaceAll(/[-]{2,}/g, '-')
            .toLowerCase()
        + '.emltpl'

    const eml = to + '\n'
        + subject + '\n'
        + 'Content-Type: text/html;charset=utf-8\n'
        + 'X-Unsent: 1'+'\n'
        + '\n'
        + '\n'
        + html;
    const bytes = new TextEncoder().encode(eml);
    const blob = new Blob([bytes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const fileLink = document.createElement('a');
    let linkText = document.createTextNode(fileName);
    fileLink.appendChild(linkText);
    fileLink.href = url;
    fileLink.download = fileName;
    fileLink.style.visibility = 'hidden';

    fileLink.onclick = () => {
      setTimeout(() => {
        fileLink.remove();
        URL.revokeObjectURL(url);
      })
    }

    document.body.appendChild(fileLink);
    fileLink.click();
  }
}

const sk = document.querySelector('helix-sidekick');
sk.addEventListener('custom:copyHtml', copyHtml);
sk.addEventListener('custom:downloadHtml', downloadHtml);
sk.addEventListener('custom:sendHtml', sendHtml);

window.addEventListener('message', ({ data, origin, source }) => {
  if (data === 'mjml2html' && origin.match('localhost(:\\d+)?$|.*\\.hlx\\.(page|live)$')) {
    const iframe = document.getElementById('__emailFrame');
    source.postMessage('mjml2html:' + (iframe ? iframe.srcdoc : ''), origin);
  }
})
