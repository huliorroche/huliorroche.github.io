import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL =
    'https://lpmpqeibsrzvmmvjnmgf.supabase.co';

const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwbXBxZWlic3J6dm1tdmpubWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTY1OTksImV4cCI6MjEwODA3MjU5OX0.onXwjCF71iu-yHR3yVYVhnEoARS2YWQWpKVftS99Stg';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

export const {
    data: { session }
} = await supabase.auth.getSession();

const accessToken =
    new URLSearchParams(
        window.location.search
    ).get("access");

let tokenUser = null;

if (!session && accessToken) {

    const {
        data
    } = await supabase
        .from("access_tokens")
        .select("user_id")
        .eq("token", accessToken)
        .eq("enabled", true)
        .maybeSingle();

    if (data) {

    const {
        data: profile
    } = await supabase
        .from("user_profiles")
        .select(`
            full_name,
            user_name,
            avatar_url
        `)
        .eq(
            "id",
            data.user_id
        )
        .maybeSingle();

    tokenUser = {

        id: data.user_id,

        email: "access-token",

        user_metadata: {

            full_name:
                profile?.full_name,

            user_name:
                profile?.user_name,

            avatar_url:
                profile?.avatar_url

        }

    };

}


}

if (!session && !tokenUser) {

    window.location.replace("../");

}

export const user =
    session?.user ||
    tokenUser;

const hiddenEmail =
    user?.user_metadata?.hidden_email === true;

const email =
    hiddenEmail
        ? ""
        : (user?.email || '');

const username =
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    user?.user_metadata?.full_name ||
    (
        email.includes("@")
            ? email.split('@')[0]
            : "Invitado"
    );

const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.user_name ||
    username;

const avatar =
    user?.user_metadata?.avatar_url || null;

const provider =
    user?.app_metadata?.provider ||
    (
        email === "access-token"
            ? "token"
            : "email"
    );


if (document.querySelector(".welcome h1")){
    document.querySelector(".welcome h1").textContent = `Bienvenido ${fullName}`;
}

if (document.querySelector(".welcome p")){
    document.querySelector(".welcome p").textContent =
    provider === 'github'
    ? 'Has iniciado sesión correctamente con GitHub.'
    : provider === 'token'
        ? 'Has accedido mediante un enlace privado.'
        : 'Has iniciado sesión correctamente con correo electrónico.';
}

if (avatar) {
    document.getElementById("userInfo").innerHTML = `
    
    <div style="
        display:flex;
        align-items:center;
        gap:10px;
    ">
        <img
            src="${avatar}"
            alt=""
            style="
                width:40px;
                height:40px;
                border-radius:50%;
            "
        >

        <div style="text-align:right;">
            <div>${fullName}</div>
            <div style="
                font-size:.85rem;
                color:#7f8691;
            ">
                @${username}
            </div>
        </div>

        <button
            id="logoutButton"
            style="
                margin-left:12px;
                background:white;
                border:1px solid #e9e3d7;
                color:#161b24;
                padding:8px 12px;
                border-radius:10px;
                cursor:pointer;
            "
        >
            Salir
        </button>
    </div>
`;

} else {

    document.getElementById("userInfo").innerHTML = `
    <div style="
        display:flex;
        align-items:center;
        gap:10px;
    ">

        <div style="
            width:40px;
            height:40px;
            border-radius:50%;
            background:#b99b68;
            color:white;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:bold;
        ">
            ${fullName.charAt(0).toUpperCase()}
        </div>

        <div style="text-align:right;">
            <div>${fullName}</div>
            ${hiddenEmail
    ? ""
    : `
        <div style="
            font-size:.85rem;
            color:#7f8691;
        ">
            ${email}
        </div>
    `
}
        </div>

        <button
            id="logoutButton"
            style="
                margin-left:12px;
                background:white;
                border:1px solid #e9e3d7;
                color:#161b24;
                padding:8px 12px;
                border-radius:10px;
                cursor:pointer;
            "
        >
            Salir
        </button>
    </div>
`;
}


document
    .getElementById("logoutButton")
    .addEventListener("click", async () => {

        await supabase.auth.signOut();

        window.location.replace(
            "index.html"
        );
    });

    window.loginWithEmail = async function () {

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;

    if (!email) {
        alert("Introduce el correo electrónico.");
        return;
    }

    if (!password) {
        alert("Introduce la contraseña.");
        return;
    }

    const {
        error
    } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert(error.message);
        return;
    }

    window.location.replace("home");
};