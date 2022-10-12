import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(["DBId", "id"])
export class Contact {
  @PrimaryGeneratedColumn()
  DBId: number;

  @Column({ unique: true })
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  notify?: string;

  @Column({ nullable: true })
  verifiedName?: string;

  @Column({ nullable: true })
  imgUrl?: string;

  @Column({ nullable: true })
  status?: string;
}
