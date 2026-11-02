(function(){'use strict';
var pending=Object.create(null),config=window.ACT_BACKEND_CONFIG||{};
function base(){var value=config.apiBaseUrl;if(!value&&/^\/shop\//.test(location.pathname))value=location.origin;if(!value)throw new Error('configuration');var url=new URL(value);if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||!(url.protocol==='https:'||(url.protocol==='http:'&&/^(127\.0\.0\.1|localhost)$/.test(url.hostname))))throw new Error('configuration');return url.origin;}
async function request(path,body,scope,signature){var timer,controller=new AbortController(),headers={},options={method:body?'POST':'GET',credentials:'omit',cache:'no-store',signal:controller.signal};if(body){if(!pending[scope]||pending[scope].signature!==signature)pending[scope]={signature:signature,key:crypto.randomUUID()};headers['Idempotency-Key']=pending[scope].key;if(body instanceof FormData)options.body=body;else{headers['Content-Type']='application/json';options.body=JSON.stringify(body);}}options.headers=headers;try{timer=setTimeout(function(){controller.abort();},20000);var response=await fetch(base()+path,options),data=await response.json();if(!response.ok){var error=new Error(data.error||data.detail||'request_failed');error.status=response.status;throw error;}if(body){if(!data.id||!data.status)throw new Error('invalid_response');delete pending[scope];}return data;}finally{clearTimeout(timer);}}
window.ACT_BACKEND={
 adminUrl:function(){return base()+'/admin';},
 order:function(data){return request('/api/orders',data,'order',JSON.stringify(data));},
 custom:function(data,file){var form=new FormData();form.append('metadata',JSON.stringify(data));if(file)form.append('reference',file);return request('/api/custom-requests',form,'custom',JSON.stringify(data)+(file?[file.name,file.size,file.lastModified].join('|'):''));},
 review:function(data){return request('/api/reviews',data,'review',JSON.stringify(data));},
 reviews:function(id){return request('/api/products/'+encodeURIComponent(id)+'/reviews');}
};
if(typeof document!=='undefined'){
 var account=document.getElementById('accountLink');
 if(account){try{account.href=base()+'/admin';}catch(error){account.addEventListener('click',function(event){event.preventDefault();alert(document.documentElement.lang==='en'?'Sign-in will be available once the backend is connected.':'Մուտքը կաշխատի backend-ը միացնելուց հետո։');});}}
}
})();
