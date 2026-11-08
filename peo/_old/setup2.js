let DB=[];
let CURRENT=0;
let LANG="pt";

const T={
    pt:{
        agenda_base:"Agenda Base",
        agenda_sonda:"Agenda Sonda",
        codigo:"Código do Requisito",
        requisito:"Requisito",
        requisitominimo:"Requisito Mínimo",
        orientacoes:"Orientações",
        autoavaliacao:"Autoavaliação",
        auditado:"Auditado",
        apoio:"Apoio"
    },
    en:{
        agenda_base:"Base Schedule",
        agenda_sonda:"Rig Schedule",
        codigo:"Requirement Code",
        requisito:"Requirement",
        requisitominimo:"Minimum Requirement",
        orientacoes:"Guidelines",
        autoavaliacao:"Self Assessment",
        auditado:"Auditee",
        apoio:"Support"
    }
};

function showError(text){
    try{
        document.getElementById("errorText").innerText=text;
        document.getElementById("errorModal").style.display="block";
    }catch(e){
        alert(text);
    }
}

function closeError(){
    document.getElementById("errorModal").style.display="none";
}

async function loadData(){
    try{
        let r=await fetch("/api/records");
        let d=await r.json();

        DB=d.records||[];

        renderCodes();
        renderRecord();

    }catch(e){
        showError(e.stack);
    }
}

function toggleLanguage(){
    try{
        LANG=LANG==="pt"?"en":"pt";
        renderRecord();
    }catch(e){
        showError(e.stack);
    }
}

function renderRecord(){

    try{

        if(DB.length===0) return;

        let r=DB[CURRENT];

        let html="";

        Object.keys(r).forEach(field=>{

            html+=`
            <div class='field-card'>
                <div class='d-flex justify-content-between'>
                    <strong>${T[LANG][field]||field}</strong>

                    <i class='fa fa-pencil edit-icon'
                       id='icon_${field}'
                       onclick="toggleEdit('${field}')"></i>
                </div>

                <textarea
                    class='form-control mt-2'
                    rows='4'
                    id='${field}'
                    readonly>${r[field]}</textarea>
            </div>
            `;
        });

        document.getElementById("recordArea").innerHTML=html;

    }catch(e){
        showError(e.stack);
    }

}

function renderCodes(){

    try{

        let html="";

        DB.forEach((r,i)=>{

            html+=`
            <tr>
            <td>
            <button class='btn btn-link'
                    onclick='gotoRecord(${i})'>
                ${r.codigo}
            </button>
            </td>
            </tr>`;
        });

        document.getElementById("codesTable").innerHTML=html;

    }catch(e){
        showError(e.stack);
    }
}

function gotoRecord(i){

    try{
        CURRENT=i;
        renderRecord();
    }catch(e){
        showError(e.stack);
    }

}

async function toggleEdit(field){

    try{

        let box=document.getElementById(field);
        let icon=document.getElementById("icon_"+field);

        if(box.readOnly){

            box.readOnly=false;

            icon.className="fa fa-save edit-icon";

        }else{

            await fetch("/api/update",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    index:CURRENT,
                    field:field,
                    value:box.value
                })
            });

            DB[CURRENT][field]=box.value;

            box.readOnly=true;

            icon.className="fa fa-pencil edit-icon";

        }

    }catch(e){
        showError(e.stack);
    }

}

async function uploadExcel(){

    try{

        document.getElementById("progressModal").style.display="block";

        let file=document.getElementById("excelFile").files[0];

        let form=new FormData();

        form.append("file",file);

        let progress=0;

        let timer=setInterval(()=>{

            progress+=10;

            if(progress>95)
                progress=95;

            let bar=document.getElementById("progressBar");

            bar.style.width=progress+"%";
            bar.innerText=progress+"%";

        },150);

        let r=await fetch("/api/upload",{
            method:"POST",
            body:form
        });

        clearInterval(timer);

        let bar=document.getElementById("progressBar");

        bar.style.width="100%";
        bar.innerText="100%";

        setTimeout(()=>{
            document.getElementById("progressModal").style.display="none";
        },500);

        let data=await r.json();

        if(data.error)
            throw data.error;

        await loadData();

    }catch(e){
        showError(e.stack||e);

        document.getElementById("progressModal").style.display="none";
    }

}

loadData();
