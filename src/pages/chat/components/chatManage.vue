<template>
    <div class="chat-manage-view">
        <div class="chat-manage-header">
            <el-input
                v-if="showSearchInput"
                ref="searchInputRef"
                v-model="searchKey"
                class="search-input"
                :placeholder="$t('ai.search.history.context')"
                :suffix-icon="Search"
                autofocus
                @blur="showSearchInput=false"
                />
            <template v-else >
                <el-button type="primary" class="add" round @click="addNewChat">
                    <i class="iconfont icon-chat-new"></i>{{$t('ai.add.new.chat')}}
                </el-button>
                <el-button :icon="Search" circle @click="handleShowSearch()"/>
            </template>
        </div>
        <div v-show="filteredHistoryList?.length" class="chat-list">
            <div class="list-title fx">
                <div class="text">{{$t('ai.history.chat')}}</div>
                <div class="delete"  @click="deleteHistoryChat()"><i class="iconfont icon-trash-alt"></i>{{$t('ai.delete.all.chat')}}</div>
            </div>
            <div class="list-content">
                <div v-for="(item,index) in filteredHistoryList" :key="index" class="list-item fx" :class="{'active':checkedHistoryId === item.contextId}" @click="goHistoryChat(item.contextId)" >
                    <div class="cont fx">
                        <i class="iconfont icon-lishiduihua"></i>
                        <p>{{item.title}}</p>
                    </div>
                    <el-dropdown trigger="hover" :teleported="false">
                        <span class="el-dropdown-link">
                            <span class="iconfont icon-vgengduo">...</span>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click.stop=deleteHistoryChat(item.contextId)><i class="iconfont icon-trash-alt"></i> {{t('common.delete')}}</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Search} from '@element-plus/icons-vue'
import { ElButton, ElInput, ElDropdown, ElDropdownMenu, ElDropdownItem, ElMessageBox, ElMessage} from 'element-plus'
import { getHistoryContextList, deleteHistoryContext } from '@/api/ai.api'
import { t } from '@jrag/lib'

const props = defineProps({
	newChat: {
		type: Function,
		required: true,
		default: ()=>{}
	},
	historyChat: {
		type: Function,
		required: true,
		default: ()=>{}
	},
	currContextId: {
		type: String,
		default: ''
	},
	messageContext: {
		type: Array,
		default: ()=>[]
	}
})
const searchInputRef = ref()
const showSearchInput = ref(false)
const searchKey = ref('')

const historyList = ref([])
const filteredHistoryList = ref([])
const checkedHistoryId = ref(props.currContextId)
const emit = defineEmits(['showChatManage'])

watch(()=>props.currContextId, (val)=>{
	checkedHistoryId.value = val
})
const handleShowSearch = ()=>{
	showSearchInput.value = true
	nextTick(()=>{
		searchKey.value = ''
		searchInputRef.value.focus()
	})

}
const addNewChat = ()=>{
	emit('showChatManage', false)
	if (!props.messageContext?.length){
		ElMessage({
			message: t('ai.already.latest.chat'),
			type: 'success',
		})
		return
	}
	checkedHistoryId.value = ''
	props.newChat()
	getHistoryListData()
}

const goHistoryChat = (constextId)=>{
	emit('showChatManage', false)
	checkedHistoryId.value = constextId
	props.historyChat(constextId)
	searchKey.value = ''
}

const getHistoryListData = ()=>{
	getHistoryContextList().then(res=>{
		historyList.value = res.data.data
		filterList(searchKey.value, res.data.data)
	})
}

const deleteHistoryChat =  (contextId?)=>{
	const contextIds = []
	if (contextId){
		contextIds.push(contextId)
	} else {
		historyList.value.forEach(i=>{
			contextIds.push(i.contextId)
		})
	}
	ElMessageBox.confirm(
		t('ai.delete.warning'),
		contextId ? t('ai.delete.chat.confirm') : t('ai.delete.all.chat.confirm'),
		{
			confirmButtonText: t('common.ok'),
			cancelButtonText: t('common.cancel'),
			type: 'warning',
		}
	).then(() => {
		deleteHistoryContext(contextIds).then(resp => {
			getHistoryListData()
			if (contextId ===  checkedHistoryId.value){
				addNewChat()
			}
		})
	})
}

watch(()=>searchKey.value, (key)=>{
	filterList(key)
})
const filterList = (key, data?)=>{
	const regex = new RegExp(key, 'i'); // 'i' 标志表示忽略大小写
	const list = data || historyList.value
	filteredHistoryList.value = list.filter(item=>{
		return regex.test(item.title)
	})
}

defineExpose({
	getHistoryListData,
})

</script>
<style lang="scss" scoped>
.iconfont{
   margin-right: 5px;
}
.chat-manage-view{
    background-color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    flex-grow: 1;
    padding: 0 20px 20px;
}
.chat-manage-header{
    text-align: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
    width: 320px;
    .el-button{
        height: 40px;
        &.add{
            width: 270px;
        }
        &.is-circle{
            flex:1;
            width: 40px;
            margin-left: 10px;
        }
    }
    .el-input{
        &.search-input{
            height: 40px;
            width: 100%;
            :deep(.el-input__wrapper){
                border-radius: 40px;
            }
        }
    }
}
.chat-list{
    padding: 10px 0 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-grow: 1;
    width: 320px;
    // max-height:520px;
    overflow: auto;
    .list-title{
        justify-content: space-between;
        width: 100%;
        margin-bottom: 5px;
        padding-right: 10px;
        .delete{
            color: var(--el-color-info);
            cursor: pointer;
            &:hover{
                color: var(--el-color-primary);
            }
        }
    }
    .list-content{
        width: 100%;
        height: 100%;
        overflow: auto;
        padding-right: 10px;
        .list-item{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            margin: 15px 0;
            padding: 0 15px;
            border: 1px solid #d5d5d5;
            background-color: #fff;
            border-radius: 15px;
            height: 45px;
            line-height: 45px;
            cursor: pointer;
            &:hover,
            &.active{
                color: var(--el-color-primary);
                border-color:  var(--el-color-primary);
                background-color: var(--el-color-primary-light-9);
            }
            .cont{
                width: calc(100% - 20px);
                flex-grow: 1;
                p{
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
            .el-dropdown{
                z-index: 999;
                width: 20px;
                padding-left: 10px;
            }
            .icon-vgengduo{
                &:hover{
                    color: var(--el-color-primary);
                }
            }
        }
        .el-dropdown-link {
            display: flex;
            align-items: center;
        }
    }

}

</style>
