<script lang="ts" setup>
import { useNotificationStore } from '@/store/useNotificationStore';
import type { Notification } from '@layouts/types';
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
const notificationStore = useNotificationStore()

interface Props {
  notifications: Notification[]
  badgeProps?: object
  location?: any
}
interface Emit {
  (e: 'read', value: number[]): void
  (e: 'unread', value: number[]): void
  (e: 'markAllRead', value: number[]): void
  (e: 'remove', value: number): void
  (e: 'click:notification', value: Notification): void
  (e: 'toggle-menu', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  location: 'bottom end',
  badgeProps: undefined,
})

const emit = defineEmits<Emit>()

const isAllMarkRead = computed(() => {
  return props.notifications.some(item => item.isSeen === false)
})



const markAllReadOrUnread = async () => {
  const allNotificationsIds = props.notifications.map(item => item.id);
  // if (!isAllMarkRead.value)
  emit('markAllRead', allNotificationsIds);
  // emit(isAllMarkedRead.value ? 'unread' : 'markAllRead', allNotificationsIds);

}

const totalUnseenNotifications = computed(() => {
  return props.notifications.filter(item => item.isSeen === false).length
})

const toggleReadUnread = (isSeen: boolean, Id: number) => {
  if (isSeen)
    emit('unread', [Id])
  else
    emit('read', [Id])
}

const handleClick = (notification) => {
  emit('click:notification', notification)
  emit('toggle-menu', false)
}

const router = useRouter()
const viewAll = () => {
  router.push('/notification')
  emit('toggle-menu', false)

}
</script>

<template>

  <IconBtn id="notification-btn" @click="$emit('toggle-menu', true)">
    <VBadge v-if="props.badgeProps" v-bind="props.badgeProps" :content="totalUnseenNotifications" :model-value="props.notifications.some(n => !n.isSeen)" color="error" offset-x="2" offset-y="3">
      <VIcon icon="tabler-bell" />
    </VBadge>
    <!-- v-if="props.badgeProps?.showMenu" -->
    <VMenu v-if="props.badgeProps?.showMenu" v-model="props.badgeProps.showMenu" activator="parent" width="380px" :location="props.location" offset="12px" :close-on-content-click="false">

      <VCard class="d-flex flex-column">
        <!-- 👉 Header -->
        <VCardItem class="notification-section">
          <VCardTitle class="text-h6">
            Notifications
          </VCardTitle>

          <template #append>
            <VChip v-show="props.notifications.some(n => !n.isSeen)" size="small" color="primary" class="me-2">
              {{ totalUnseenNotifications }} New
            </VChip>
            <IconBtn v-show="props.notifications.length" size="34" @click="markAllReadOrUnread">
              <VIcon size="20" color="high-emphasis" :icon="!isAllMarkRead ? 'tabler-mail' : 'tabler-mail-opened' " />

              <VTooltip v-if="isAllMarkRead" activator="parent" location="start">
                {{ isAllMarkRead ? 'Mark all as read' : 'Mark all as unread' }}
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />

        <!-- 👉 Notifications list -->
        <PerfectScrollbar :options="{ wheelPropagation: false }" style="max-block-size: 23.75rem;">
          <transition-group name="list" tag="div" class="notification-transition">
            <template v-for="(notification, index) in props.notifications" :key="notification.id">
              <VDivider v-if="index > 0" />
              <VListItem link lines="one" min-height="66px" class="list-item-hover-class" @click="handleClick(notification)">
                <div class="d-flex align-start gap-3">
                  <VAvatar :color="notification.color && !notification.img ? notification.color : undefined" :variant="notification.img ? undefined : 'tonal' ">
                    <span v-if="notification.text">{{ avatarText(notification.text) }}</span>
                    <VImg v-if="notification.img" :src="notification.img" />
                    <VIcon v-if="notification.icon" :icon="notification.icon" />
                  </VAvatar>

                  <div>
                    <p class="text-sm font-weight-medium mb-1">{{ notification.title }}</p>
                    <p class="text-body-2 mb-2">{{ notification.subtitle }}</p>
                    <p class="text-sm text-disabled mb-0">{{ notification.time }}</p>
                  </div>

                  <VSpacer />

                  <div class="d-flex flex-column align-center">
                    <IconBtn size="8" class="mb-2" @click.stop="toggleReadUnread(notification.isSeen, notification.id)">
                      <VIcon size="8" :icon="notification && notification.isSeen == true ? 'tabler-circle' : 'tabler-circle-filled'" />
                      <v-tooltip left activator="parent">
                        {{ notification.isSeen ? 'Mark as Unread' : 'Mark as read'}}
                      </v-tooltip>
                    </IconBtn>

                    <IconBtn size="20" class="close-icon" @click.stop="$emit('remove', notification.id)">
                      <VIcon size="15" icon="tabler-x" />
                    </IconBtn>
                  </div>
                </div>
              </VListItem>
              <VListItem v-show="!props.notifications.length" class="text-center text-medium-emphasis">
                <VListItemTitle>No Notification Found!</VListItemTitle>
              </VListItem>
            </template>

          </transition-group>

        </PerfectScrollbar>

        <VDivider />

        <!-- 👉 Footer -->
        <VCardText v-show="props.notifications.length" class="pa-4">
          <VBtn block size="small" @click="viewAll">
            View All Notifications
          </VBtn>
        </VCardText>
      </VCard>
    </VMenu>

  </IconBtn>
</template>

<style lang="scss">
// Add this to your style section
.list-enter-active,
.list-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.list-enter {
  opacity: 0;
  transform: translateX(-15px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(15px);
}

.notification-section {
  padding-block: 0.75rem;
  padding-inline: 1rem;
}

.icon:hover {
  background: red;
}

.list-item-hover-class {
  .visible-in-hover {
    display: none;
  }
  .close-icon {
    margin-right: 4px; /* Change to your desired color */
  }

  &:hover {
    .visible-in-hover {
      display: block;
    }
    .close-icon {
      color: red;
      margin-right: 4px; /* Change to your desired color */
    }
  }
}

.notification-list.v-list {
  .v-list-item {
    border-radius: 0 !important;
    margin: 0 !important;
    padding-block: 0.75rem !important;
  }
}

// Badge Style Override for Notification Badge
.notification-badge {
  .v-badge__badge {
    /* stylelint-disable-next-line liberty/use-logical-spec */
    min-width: 18px;
    padding: 0;
    block-size: 18px;
  }
}
</style>
