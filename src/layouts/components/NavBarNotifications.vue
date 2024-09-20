<script lang="ts" setup>
import { router } from '@/plugins/2.router';
import { useNotificationStore } from '@/store/useNotificationStore';
import type { Notification } from '@layouts/types';

const notificationStore = useNotificationStore()
const { notificationsList } = storeToRefs(notificationStore)
const { markAllAsRead, toggleSeen } = notificationStore

// const notifications = ref<Notification[]>([
//   {
//     id: 1,
//     img: avatar4,
//     title: 'Congratulation Flora! 🎉',
//     subtitle: 'Won the monthly best seller badge',
//     time: 'Today',
//     isSeen: false,
//     color: 'error'
//   }
// ])
const badgeProps = ref({ content: notificationsList.value.length, max: '99', showMenu: false })
const showMenu = ref(false)
const router = useRouter();

badgeProps.value.content = notificationsList.value.length


const removeNotification = (notificationId: number) => {
  notificationsList.value.forEach((item, index) => {
    if (notificationId === item.id)
      (item.icon) === 'tabler-school' ? notificationStore.deleteNotification(notificationId).then(() => notificationStore.removeNotification(notificationId)) : notificationStore.deleteNotification(notificationId).then(() => notificationStore.removeNotification(notificationId))

    // notificationsList.value.splice(index, 1)

  })
}

watch(notificationsList, (newNotificationsList: Notification[]) => {
  console.log(newNotificationsList);

  notificationsList.value = newNotificationsList
})


const markAllRead = (allNotificationsIds: number[]) => {
  markAllAsRead().then(() => {
    markRead(allNotificationsIds)
  })
}


const markRead = (notificationId: number[]) => {
  console.warn("dlkjkfd", notificationId[0]);


  toggleSeen(notificationId[0]).then((res) => {
    console.log(res);

    notificationsList.value.forEach(item => {
      notificationId.forEach(id => {
        if (id === item.id)
          item.isSeen = true
      })
    })
  })

}

const markUnRead = (notificationId: number[]) => {
  toggleSeen(notificationId[0]).then((res) => {
    console.log(res);

    notificationsList.value.forEach(item => {
      notificationId.forEach(id => {
        if (id === item.id)
          item.isSeen = false
      })
    })
  })
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.isSeen) {
    markRead([notification.id])
    notification.icon === 'tabler-school' ? router.push(`/notification/registration/${notification.email}`) : router.push(`/notification/payment/${notification.paymentId}`)
    toggle(false)
  }
}

const toggle = (val) => {
  console.log(val);

  badgeProps.value.showMenu = val
}
// notificationsList.sort((a,b)=>a.isSeen - b.isSeen)
</script>

<template>
  <Notifications :notifications="notificationsList" :badge-props="badgeProps" @mark-all-read="markAllRead" @remove="removeNotification" @read="markRead" @unread="markUnRead" @click:notification="handleNotificationClick" @toggle-menu="toggle" />
</template>
