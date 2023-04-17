function $(id) {
    return document.getElementById(id);
  }

function inviteToDiscord(){
    window.open('https://discord.gg/hp2jUrGADp');
}
function inic(){
    create_table();
}

function create_table(){
    let request = new XMLHttpRequest();
    request.open('GET','https://api.github.com/users/gfmcosta/repos',true);

    request.onload = function(){
        let data = JSON.parse(this.response);
        let codHTML=''
        let ordem = 0
        let rotate=false
        $.each(data,function(i,status){
            ordem=ordem+1
            if(rotate){
                codHTML+='<tr style="background-color:#FFFFFF;color:black">'
                codHTML+='<th scope="row">'+ordem+'</th>'
                codHTML+='<td>'+status.name+'</td>'
                codHTML+='<td><a href="'+status.html_url+'" target=_blank>'+status.html_url+'</a></td>'
                console.log(status.language)
                if (status.language==null){
                    codHTML+='<td>-</td>'
                }else{
                    codHTML+='<td>'+status.language+'</td>'
                }
                codHTML+='</tr>'
                rotate=false
            }else{
                codHTML+='<tr style="background-color:#E8E8E8;color:black">'
                codHTML+='<th scope="row">'+ordem+'</th>'
                codHTML+='<td>'+status.name+'</td>'
                codHTML+='<td><a href="'+status.html_url+'" target=_blank>'+status.html_url+'</a></td>'
                console.log(status.language)
                if (status.language==null){
                    codHTML+='<td>-</td>'
                }else{
                    codHTML+='<td>'+status.language+'</td>'
                }               
                codHTML+='</tr>'
                rotate=true
            }
            
        });

        $('tbody').html(codHTML);
    }
    request.send();
}