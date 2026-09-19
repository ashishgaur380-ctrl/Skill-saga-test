# Authorization Matrix v1

| Role | Platform Admin | Content | Moderation | Finance | Teaching | Parent | Learner |
|---|---:|---:|---:|---:|---:|---:|---:|
| super_admin | Full | Full | Full | Full | Full | Full | Full |
| admin | Yes | Full | Full | Config | Oversight | Oversight | Oversight |
| content_manager | No | Full | No | No | No | No | No |
| moderator | No | Limited | Full | No | Limited | No | No |
| support | No | View | Limited | No | View | Support | Support |
| finance | No | No | No | Full | No | No | No |
| school_admin | No | School | School | No | School | School | School |
| teacher | No | Own/Class | Class | No | Own/Class | Linked | Assigned |
| parent | No | Assigned | No | Purchases | Child | Own | Child |
| learner | No | Published | No | Own | Own | No | Own |

This matrix is the product-level intent. Firestore rules and server authorization will implement the actual enforcement.
