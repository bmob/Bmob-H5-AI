<template>
    <div>
        <div class="banner">Bmob AI Demo</div>
        <div class="box-chat">
            <div v-for="item in list" :key="item.id" class="item" :class="{ 'item-my' : item.isMy}">
                <img v-if="item.isMy" class="avatar" src="../assets/bmob.png">
                <img v-else class="avatar" src="../assets/helper.png">
                <div class="dialog">
                    <vue-markdown :source="item.content" />
                </div>
            </div>
        </div>
        <div class="row-send">
            <div class="btn-clean" @click="cleanList">
                <img src="../assets/clean.png">
                <span>新主题</span>
            </div>
            <input v-model="msg" placeholder="输入你想问的..." size="normal" @keyup.enter="onSubmit" />
            <div class="btn-send" @click="onSubmit">
                <img src="../assets/send.png" />
            </div>
        </div>
    </div>
</template>
<script>
import VueMarkdown from 'vue-markdown'
import Bmob from "hydrogen-js-sdk";
// Bmob.initialize("你的Secret Key", "你的API 安全码");
Bmob.initialize('fda2aa4220549f74', '8f7jh2529a18d30q');

export default {
    components: { VueMarkdown },
    data() {
        return {
            ChatAi: null,
            list: [{
                isMy: false,
                content: '欢迎来自Bmob后端云的开发者，有什么问题可以随时找我哦~~~'
            }],

            msg: '',
            lastId: '',

            userId: '',
            leftCount: 0
        }
    },
    mounted() {
        Bmob.User.login('username', 'password').then(res => {
            this.userId = res.objectId
            this.initChatAi()
        }).catch(err => {
            console.error(err)
        });
        this.leftCount = this.getLeftAiCount()
        console.log('this.leftCount',this.leftCount )
    },

    methods: {
        setLeftAiCount(count) {
            console.log('setLeftAiCount',count )
            localStorage.setItem('lac',count)
        }, 
        getLeftAiCount() {
           let res = localStorage.getItem('lac')
           if(!res && res!=0) res = 20
           return res;
        },
        cleanList() {
            this.list = this.$options.data().list
        },
        initChatAi() {
            this.ChatAi = Bmob.ChatAI()
            // this.loadDefault() // 加载最近聊天记录

            let msg = ''
            this.ChatAi.onMessage((res) => {
                if (res == "done") {
                    this.setMsg(this.lastId, msg)
                    if (msg) {
                        this.lastId = '';
                        msg = ''
                    }
                } else {
                    msg = msg + res
                    this.setMsg(this.lastId, msg)
                }
            })
            
            this.ChatAi.onClose(() => {
                console.log("连接被关闭");
                this.ChatAi.connect()
            })
        },
        onSubmit() {
            if (this.leftCount <= 0) {
                alert('您的提问次数已达上限，注册登录后可继续使用')
                window.open('https://www.bmobapp.com/helper/index')
                return
            }
            if (this.userId && this.msg && !this.lastId) {
                const msg = this.msg
                this.list.push({
                    isMy: 1,
                    content: msg
                })
                const id = new Date().getTime()
                console.log('this.lastId = 111', this.lastId)
                this.list.push({
                    isMy: 0,
                    content: 'loading...',
                    id
                })
                this.msg = ''
                const len = this.list.length
                let start = len - 6
                if (start < 1) start = 1
                let data = { "messages": [{ "content": msg, "role": "user" }], "session": this.userId }
                try{
                    this.ChatAi.send(JSON.stringify(data))
                    this.lastId = id
                    this.setLeftAiCount(--this.leftCount)
                }catch(err){
                    console.error(err)
                }
                this.scrollToBottom()
            }
        },
        setMsg(id, msg) {
            if (!msg) return
            const i = this.list.findIndex(e => e.id == id)
            if (i > -1) {
                this.list[i].content = msg
            }
            this.scrollToBottom()
        },

        loadDefault() {
            // 进入聊天室先加载之前最后5条聊天记录
            const query = Bmob.Query('ai_log')
            query.equalTo("session", "==", this.useId)
            query.order('-createdAt')
            query.limit(5)
            //  查询所有数据
            query.find().then(results => {
                if (results && results.length) {
                    this.list = this.list.concat(results.reverse().map(e => {
                        return {
                            isMy: e.role === "assistant" ? false : true,
                            content: e.messages,
                            id: e.objectId
                        }
                    }))
                }
            }).catch(error => {
                console.error(error)
                console.log('查询失败: ' + error.code + ' ' + error.message)
            })
        },

        scrollToBottom() {
            this.$nextTick(() => {
                document.querySelector('.box-chat').scrollTop = 9999999999
            })
        }
    }
}
</script>
<style scoped>
@import './helper.css'
</style>