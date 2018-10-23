let $firstButton = $(".first");
let $secondButton = $(".second");
let $email = $("#bultEmail");
let $password = $("#bultPassword");
let $ctr = $(".container");

let bultResponse = null;

$firstButton.on("click", (e) => {
    e.preventDefault();

    
    if ($email.val().length > 0 && $password.val().length > 0) {
        axios({
            method: "POST",
            url: "https://bult.app/api-auth/v1/login",
            data: {
                email: $email.val(),
                password: $password.val()
            }
        }).then((response) => {
            if (response.data.error) {
                $("#errorMessageBult").text(response.data.message).queue(() => {
                    setTimeout(() => {
                        $("#errorMessageBult").text("");
                    }, 3500);
                });
                return;
            } else {
                bultResponse = response.data;
                $ctr.addClass("center slider-two-active").removeClass("full slider-one-active");

                return;
            }
        }).catch((error) => {
            console.log(error);
            return;
        });
    } else {
        $ctr.addClass("center slider-two-active").removeClass("full slider-one-active");
        bultResponse = null;
        return;
    }
});

$secondButton.on("click", (e) => {
    e.preventDefault();

    $(".second.next").text("Installing...").attr("disabled", "disabled");

    axios({
        method: "POST",
        url: "/install",
        data: {
            bult: bultResponse
        }
    }).then((response) => {
        $ctr.addClass("full slider-three-active").removeClass("center slider-two-active slider-one-active");
    }).catch((error) => {
        console.log(error);
    });
});