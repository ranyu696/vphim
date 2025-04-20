# Mermaid UML Class Diagrams

This directory contains UML class diagrams for the VePhim API application modules created using Mermaid markdown syntax.

## Available Diagrams

1. **Module Relationships Diagram**
   - [module_relationships_diagram.md](./module_relationships_diagram.md): Shows how all modules relate to and depend on each other

2. **Feature Module Diagrams**
   - [auth_module_diagram.md](./auth_module_diagram.md): Authentication system
   - [users_module_diagram.md](./users_module_diagram.md): User management functionality
   - [movie_module_diagram.md](./movie_module_diagram.md): Core movie functionality
   - [comments_module_diagram.md](./comments_module_diagram.md): Comment system
   - [watch_history_module_diagram.md](./watch_history_module_diagram.md): Watch history tracking
   - [actor_module_diagram.md](./actor_module_diagram.md): Actor management
   - [category_module_diagram.md](./category_module_diagram.md): Category management
   - [director_module_diagram.md](./director_module_diagram.md): Director management
   - [regions_module_diagram.md](./regions_module_diagram.md): Region/country management
   - [images_module_diagram.md](./images_module_diagram.md): Image handling functionality

## How to View and Use

These diagrams use Mermaid syntax, which is supported by many platforms including:
- GitHub Markdown
- GitLab Markdown
- VS Code (with Mermaid extension)
- Notion
- Confluence (with Mermaid plugin)

You can also render these diagrams online using the [Mermaid Live Editor](https://mermaid.live/).

## Diagram Elements

The diagrams follow UML notation with:

- **Access modifiers**: `+` (public), `-` (private)
- **Relationships**:
  - `*--`: Composition relationship (one entity "owns" another)
  - `-->`: Association relationship (one entity "uses" another)
  - `..>`: Dependency relationship (temporary "uses" relationship)
  - `--|>`: Inheritance relationship (one entity "is a" type of another)
  - `o--`: Aggregation relationship (one entity "has a" relationship with another)

Note: Explicit relationship labels (like "uses", "contains", "returns", etc.) have been removed for cleaner diagrams. The arrow types above are sufficient to understand the relationship types.

## Additional Notes

These diagrams are alternative versions of the PlantUML diagrams in the parent directory but using Mermaid syntax instead. 
