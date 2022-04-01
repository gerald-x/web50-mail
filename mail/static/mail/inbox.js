document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => {
        load_mailbox('inbox');
        open_mail('inbox');
    });
    document.querySelector('#sent').addEventListener('click', () => {
        load_mailbox('sent');
        open_mail('sent');
    });
    document.querySelector('#archive').addEventListener('click', () => {
        load_mailbox('archive');
        open_mail('archive');
    });
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');

    // submit form
    document.querySelector('#compose-form').addEventListener('submit', submitForm);


});

function open_mail(mailbox) {
    setTimeout(() => {
        var mails = document.querySelectorAll(".mail");
        console.log(mails);

        let button;
        if (mailbox === "inbox") {
            button = document.createElement("button");
            button.classList.add("btn", "btn-outline-danger", "btn-sm", "mt-4");
            button.id = "archiveMail";
            button.innerHTML = "Archive";
        }

        if (mailbox === "archive") {
            button = document.createElement("button");
            button.classList.add("btn", "btn-outline-danger", "btn-sm", "mt-4");
            button.id = "unarchive";
            button.innerHTML = "Unarchive";
        }

        if (mails.length >= 0) {
            mails.forEach(element => {

                //Open each mail
                element.addEventListener('click', () => {

                    fetch('/emails/' + element.id, {
                        method: 'PUT',
                        body: JSON.stringify({
                            read: true
                        })
                    })

                    fetch('/emails/' + element.id)
                        .then(response => response.json())
                        .then(emails => {
                            // Print emails
                            console.log(emails);

                            //close other views 
                            document.querySelector('#emails-view').style.display = 'none';
                            document.querySelector('#compose-view').style.display = 'none';
                            document.querySelector('#single-mail').style.display = 'block';
                            document.querySelector('#single-mail').innerHTML = '';



                            var sender = document.createElement('div');
                            var recipient = document.createElement('div');
                            var subject = document.createElement('div');
                            var time = document.createElement('div');
                            var body = document.createElement('div');
                            var reciever = "";
                            var reply = document.createElement("button");

                            sender.classList.add("my-2");
                            recipient.classList.add("my-2");
                            subject.classList.add("my-2");
                            time.classList.add("my-2");
                            body.classList.add("my-2");
                            reply.classList.add("btn", "btn-sm", "btn-outline-success", "mt-4", "mx-3")

                            //populate the elements with data
                            sender.innerHTML = '<span class="font-weight-bold"> Sender: </span>' + emails['sender'];

                            for (let index = 0; index < emails['recipients'].length; index++) {
                                reciever = reciever + " " + emails['recipients'][index];
                            }

                            recipient.innerHTML = "<span class='font-weight-bold'> Recipient(s): </span>" + reciever;

                            time.innerHTML = emails['timestamp'];

                            subject.innerHTML = "<span class='font-weight-bold'> Subject: </span>" + emails['subject'];

                            body.innerHTML = emails["body"].replace(/\n/g, "<br>");

                            reply.innerHTML = "Reply"

                            // Add the created elements to the mail view
                            var mail_view = document.querySelector('#single-mail');

                            mail_view.appendChild(sender);
                            mail_view.appendChild(recipient);
                            mail_view.appendChild(time);
                            mail_view.appendChild(subject);
                            mail_view.appendChild(body);
                            mail_view.appendChild(button);

                            if (mailbox !== "sent")
                                mail_view.appendChild(reply);

                            button.addEventListener("click", () => {
                                update_status(button.id, element.id)
                            })

                            reply.addEventListener("click", () => {
                                reply_mail(element.id);
                            })
                        })

                });

            });
        }

    }, 1000)
}



function reply_mail(id) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#single-mail').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    fetch('/emails/' + id)
        .then(response => response.json())
        .then(email => {

            let subject = email["subject"];
            let pattern = /\bRe(?=:)/;
            let result = subject.match(pattern);

            if (result)
                subject = subject;
            else
                subject = "Re: " + subject;

            let body = `\n\nOn ${email["timestamp"]}   ${email["sender"]} wrote:\n${email["body"]}`

            document.querySelector("#compose-recipients").setAttribute("value", email["sender"])
            document.querySelector("#compose-subject").setAttribute("value", subject)
            document.querySelector("#compose-body").innerHTML = body;
            document.getElementById("compose-body").focus();
        })
}


function update_status(status, id) {
    let bool;
    if (status === "archiveMail")
        bool = true;
    else
        bool = false;

    fetch('/emails/' + id, {
        method: 'PUT',
        body: JSON.stringify({
            archived: bool
        })
    })
}



function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#single-mail').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#single-mail').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


    fetch('/emails/' + mailbox)
        .then(response => response.json())
        .then(emails => {
            // Print emails
            console.log(emails);

            for (let i = 0; i < emails.length; i++) {

                //create elements for mail 
                let element = document.createElement('div');
                let span1 = document.createElement('span');
                let span2 = document.createElement('span');
                let timestamp = document.createElement('span');

                username = document.querySelector(".username").innerHTML;
                confirmation = emails[i]["sender"];

                if (username === confirmation)
                    span1.innerHTML = emails[i]['recipients']
                else
                    span1.innerHTML = emails[i]['sender']


                span2.innerHTML = emails[i]['subject'];
                timestamp.innerHTML = emails[i]['timestamp'];

                element.appendChild(span1);
                element.appendChild(span2);
                element.appendChild(timestamp);

                if (emails[i]['read'] === false)
                    state = 'unread';
                else
                    state = 'read';

                element.id = emails[i]['id'];
                element.classList.add('mail-divs', 'p-1', state, 'mail')
                span1.classList.add('font-weight-bold', 'pl-1')
                span2.classList.add('pl-2')
                timestamp.classList.add('font-weight-light', 'timestamp')

                document.querySelector('#emails-view').appendChild(element);
            }
        });

}


function submitForm() {
    fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);
        });

    //load_mailbox('sent');
}