// utils/permission.js

import { setSelectedRoleToken } from '@/middleware/auth' // Import token storage function
import { navigateTo } from 'nuxt/app'

/**
 * Function to select a role and obtain a token.
 * Calls the API with the selected role, stores the token, and redirects.
 * 
 * @param {Object} roleDetails - The details of the selected role, including name.
 */
export async function editPermission(roleDetails) {
  try {
    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation Mutation($roleName: String!) {
            selectRole(roleName: $roleName)
          }
        `,
        variables: {
          roleName: roleDetails.name, // Passing role name dynamically
        },
      }),
    })

    const result = await response.json()

    if (result.data && result.data.selectRole) {
      // Store the token for use in other pages
      setSelectedRoleToken(result.data.selectRole)

      // Navigate to the homepage after selecting the role
      navigateTo('/')
    } else {
      console.error('Failed to obtain token:', result.errors)
    }
  } catch (error) {
    console.error('Error selecting role:', error)
  }
}
