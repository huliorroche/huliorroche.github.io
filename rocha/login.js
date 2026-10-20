import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL =
    'https://lpmpqeibsrzvmmvjnmgf.supabase.co';

const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwbXBxZWlic3J6dm1tdmpubWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0OTY1OTksImV4cCI6MjEwODA3MjU5OX0.onXwjCF71iu-yHR3yVYVhnEoARS2YWQWpKVftS99Stg';

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const {
    data: { session }
} = await supabase.auth.getSession();

if (!session) {
    window.location.replace("../");
}

const user = session.user;

const email = user.email || '';

const username =
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    email.split('@')[0];

const fullName =
    user.user_metadata?.full_name ||
    username;

const avatar =
    user.user_metadata?.avatar_url || null;

const provider =
    user.app_metadata?.provider || 'email';


if (document.querySelector(".welcome h1")){
    document.querySelector(".welcome h1").textContent = `Bienvenido ${fullName}`;
}

if (document.querySelector(".welcome p")){
    document.querySelector(".welcome p").textContent =
    provider === 'github'
        ? 'Has iniciado sesión correctamente con GitHub.'
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
            <div style="
                font-size:.85rem;
                color:#7f8691;
            ">
                ${email}
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
}

document
    .getElementById("logoutButton")
    .addEventListener("click", async () => {

        await supabase.auth.signOut();

        window.location.replace(
            "index.html"
        );
    });