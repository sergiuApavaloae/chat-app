const socket=io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $messages=document.querySelector('#messages')
//Templates
const messageTempalate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username , room}= Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoScroll=()=>{
    const $newMessage=$messages.lastElementChild

    const newMesageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMesageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin

    const visibleHeight= $messages.offsetHeight

    const containerHeigth= $messages.scrollHeight

    const scrollOffset=$messages.scrollTop + visibleHeight

    if(containerHeigth-newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message',(message)=>{
    const html=Mustache.render(messageTempalate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()

})

socket.on('locationMessage',(message)=>{
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
       
        if(error){
          return  console.log(error);
        }
        console.log('The message was delivered!')
    })
})

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log('location shared')
        })
    })
})

socket.emit('join', {username , room},(error)=>{
    
    if(error){
        alert(error)
        location.href='/'
    }
})