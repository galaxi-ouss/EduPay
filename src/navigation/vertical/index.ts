
import type { VerticalNavItems } from '@layouts/types'
import home from './home'
import payments from './payments'
import students from './students'
import users from './users'

export default [...home, ...payments, ...students, ...users] as VerticalNavItems
