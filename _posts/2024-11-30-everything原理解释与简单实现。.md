---
title: "everything原理解释与简单实现。"
date: 2024-11-30 22:47:36
description: "外面疫情正严重，老师也还没开始上课，我都在家宅了一个多月了。。。实在是闲的无聊。学习？怎么可能，学习是不可能学习的，这辈子都不可能学习的。"
tags: [工具, 源码分析, 搜索]
category: "技术笔记"
---

# everything原理解释与简单实现。

外面疫情正严重，老师也还没开始上课，我都在家宅了一个多月了。。。实在是闲的无聊。学习？怎么可能，学习是不可能学习的，这辈子都不可能学习的。

前几天，在和大佬聊天的时候，偶然听说了一个名叫everything的软件，可以很方便的查询电脑内的文件位置，据说可以秒出结果。只不过只针对NTFS文件系统的盘。在网上查了下，才知道是依赖于NTFS系统自身的特性。everything使用了NTFS文件系统自身的USN Journal。这个USN是什么东西呢，它就相当于NTFS的一个秘书，对NTFS里任何一个文件的操作都会被如实的记录下来。在NTFS分区内，文件信息存储在MFT内，MFT表里的记录包含了文件和目录的所有信息，例如文件名/目录名、路径、大小、属性等。此外，还会存储该文件/目录最后一次变化所对应的USN，系统在更新USN Journal时，也会更新这个字段。

everything在第一次启动时，会获取MFT内的所有记录，将其保存在数据库内，以后每次启动时只要获取一下USN Journal的文件更新信息就好了。所以查询时是查的数据库内的数据而非直接在电脑内查，速度自然快得多。

实现思路，首先利用GetLogicalDriveStrings函数获取电脑内所有的系统盘符，然后利用GetVolumeInformationA函数判断是否是NTFS文件系统，如果是，使用CreateFileA函数获取系统盘句柄，然后使用DeviceIoControl函数，使用FSCTL\_CREATE\_USN\_JOURNAL参数初始化USN文件，再使用FSCTL\_QUERY\_USN\_JOURNAL参数获取信息，接下来使用FSCTL\_ENUM\_USN\_DATA参数获取系统的所有的文件信息，由于MFT表内没有记录文件的路径，只有文件号\(FileReferenceNumber\)和父文件号\(ParentFileReferenceNumber\)，而Windows自身没有提供相应的API来完成这个功能，所以这部分只能自己实现。在获取了所有文件信息后，可以使用FSCTL\_READ\_USN\_JOURNAL参数监控系统中的文件变化，最后记得删除USN文件。

```
#include <bits/stdc++.h>
#include <windows.h>
#include <winbase.h>
#include <mysql.h>
#include <conio.h>
#include <io.h>
#include <fstream>
#include <sys/stat.h>
#include <regex>
using namespace std;
#define ll long long
#define buf_len 4096//4K 
struct node
{
	LARGE_INTEGER TimeStamp;
	DWORD Reason;
	ll frn;
	char* FileName;
};
MYSQL mysql;//mysql连接
MYSQL_RES *res;//返回行的一个查询结果集
MYSQL_ROW rows;//一个行数据的类型安全(type-safe)的表示
string sql;//sql 语句
char buf[buf_len];//缓冲区，大小为4K
HANDLE handle;//驱动盘句柄
const ll TrueRoot=1407374883553285;//根目录的文件号，似乎所有的NTFS文件系统的根文件号都是这个，与盘无关，甚至与机器无关
int num=0;//文件个数
map<long long, vector<pair<long long, string> > >ma;//因为一个目录内不一定只有一个子目录或文件，所以是1对多映射
map<long long, string> mm;//
vector<node> ve;
void getUSNUpdate(USN_JOURNAL_DATA ujd)//理论上方法应该没问题，但获取的东西根本不是我想要的，所以这个函数似乎没用
{
	DWORD usnDataSize;//USN Journal数据的大小
	PUSN_RECORD usnRecord;
	READ_USN_JOURNAL_DATA rujd = { 0, (DWORD)-1, 0, 0, 0, ujd.UsnJournalID };
	for(; DeviceIoControl(handle,FSCTL_READ_USN_JOURNAL,&rujd,sizeof(rujd),buf,buf_len,&usnDataSize,NULL); \
	        rujd.StartUsn=*(USN*)&buf)
	{
		DWORD len = usnDataSize-sizeof(USN); //本页USN记录的长度
		usnRecord=(PUSN_RECORD)((PCHAR)buf+sizeof(USN));//获取第一个USN记录
		if(len<=0) break;
		while(len)
		{
			const int Len = usnRecord->FileNameLength;//将宽字符文件名转换为多字符，方便阅读
			char fileName[MAX_PATH] = {0};
			WideCharToMultiByte(CP_ACP,NULL,usnRecord->FileName,Len/2,fileName,Len,NULL,NULL);
			ve.push_back({usnRecord->TimeStamp,usnRecord->Reason,usnRecord->FileReferenceNumber,fileName});
			DWORD recordLen = usnRecord->RecordLength;
			len -= recordLen;
			usnRecord=(PUSN_RECORD)((PCHAR)usnRecord+recordLen); //获取下一个USN记录
		}
	}
}
void closeUsn(USN_JOURNAL_DATA &ujd,DWORD &br)//关闭USN Journal数据文件
{
	DELETE_USN_JOURNAL_DATA dujd= {ujd.UsnJournalID,USN_DELETE_FLAG_DELETE};
	DeviceIoControl(handle,FSCTL_DELETE_USN_JOURNAL,&dujd,sizeof(dujd),NULL,0,&br,NULL);
}
void getUsnData(USN_JOURNAL_DATA &ujd)//获取USN Journal数据
{
	DWORD usnDataSize;//USN Journal数据的大小
	PUSN_RECORD usnRecord;
	MFT_ENUM_DATA med= {0,0,ujd.NextUsn};
	for(; DeviceIoControl(handle,FSCTL_ENUM_USN_DATA,&med,sizeof(med),buf,buf_len,&usnDataSize,NULL); \
	        med.StartFileReferenceNumber = *(USN *)&buf)//获取下一页的USN记录，应该吧，我是这么理解的
	{
		DWORD len = usnDataSize-sizeof(USN); //本页USN记录的长度
		usnRecord=(PUSN_RECORD)((PCHAR)buf+sizeof(USN));//获取第一个USN记录
		while(len)
		{
			const int Len = usnRecord->FileNameLength;//将宽字符文件名转换为多字符，方便阅读
			char fileName[MAX_PATH] = {0};
			WideCharToMultiByte(CP_ACP,NULL,usnRecord->FileName,Len/2,fileName,Len,NULL,NULL);
			ma[usnRecord->ParentFileReferenceNumber].push_back(make_pair(usnRecord->FileReferenceNumber,fileName));//存储信息
			DWORD recordLen = usnRecord->RecordLength;
			len -= recordLen;
			usnRecord=(PUSN_RECORD)((PCHAR)usnRecord+recordLen); //获取下一个USN记录
		}
	}
}
void getUsnLogInformation(DWORD &br)
{
	USN_JOURNAL_DATA ujd;
	if(DeviceIoControl(handle,FSCTL_QUERY_USN_JOURNAL,NULL,0,&ujd,sizeof(ujd),&br,NULL))
	{
		getUsnData(ujd);
//		getUSNUpdate(ujd);
		closeUsn(ujd,br);
	}
	else printf("获取USN Journal信息失败%d\n",GetLastError());
}
void initUsnLog()
{
	DWORD br;
	CREATE_USN_JOURNAL_DATA cujd= {0,0};
	if(DeviceIoControl(handle,FSCTL_CREATE_USN_JOURNAL,&cujd,sizeof(cujd),NULL,0,&br,NULL))
		getUsnLogInformation(br);
	else printf("初始化USN Journal文件失败，%d\n",GetLastError());
}
void getHandle(char *name)//获取驱动盘句柄
{
	string Name="\\\\.\\"+(string)name;//转换成string类型方便进行去尾 ,即字符'\'
	Name.erase(Name.find_last_of(":")+1);
	//需要管理员权限，我实在是做不到在代码里加了，找不到一个有用的方法
	handle = CreateFileA(&Name[0],GENERIC_READ | GENERIC_WRITE,FILE_SHARE_READ | FILE_SHARE_WRITE,\
	                     NULL,OPEN_EXISTING,FILE_ATTRIBUTE_READONLY,NULL);//打开USN日志文件
	if(handle != INVALID_HANDLE_VALUE) initUsnLog();
	else printf("获取驱动盘句柄失败，error：%d\n",GetLastError());
}
bool checkNTFS(char* name)//检查是否是NTFS文件系统盘
{
	char nameBuf[15];
	if(GetVolumeInformationA(name,NULL,0,NULL,NULL,NULL,nameBuf,15))//获取磁盘信息
		return strcmp(nameBuf,"NTFS") ? 0 : 1;
	else printf("获取磁盘信息失败，error：%d\n",GetLastError());
}
void replace(string &str)
{
	int pos;
	pos = str.find_last_of("\\");
	str.replace(pos,string("\\").length(),"\\\\");
//    while(pos != -1){
//        // str.length()求字符的长度，注意str必须是string类型
//        str.replace(pos,string("\\").length(),"\\\\");
//        pos = str.find("\\");
//    }
}
void build(string path,string name,long long pfrn)//采用dfs进行建树，路径，文件名和父文件号
{
	if(path[path.length()-1]=='\\') path.erase(path.length()-1);
//	cout<<path<<endl;
	vector<pair<long long,string> >tmp = ma[pfrn];
	if(tmp.size())
		for(auto i:tmp)
		{
			build(path+"\\\\"+name,i.second,i.first);
		}
	else
	{
		mm[pfrn]=path+"\\"+name, num++;
//		replace(path);
		sql="insert into myfile values (\""+path+"\", \""+name+"\");";
//		if(path[0]=='E')cout<<path<<endl;
		if(mysql_query(&mysql,sql.c_str()))
		{
			printf("sql语句 %s 执行出现异常：%s\n",sql.c_str(),mysql_error(&mysql));
		}
	}
//	queue<pair<ll,string> > q;//因为dfs比bfs稍微快一点点，所以就没有使用bfs了
//	q.push(make_pair(pfrn,path));
//	while(!q.empty())
//	{
//		pair<ll,string> no=q.front();
//		q.pop();
//		vector<pair<long long,string> >tmp = ma[no.first];
//		if(tmp.size())
//		{
//			for(auto i:tmp)
//			{
//				q.push(make_pair(i.first,no.second+"\\"+i.second));
//			}
//		}
//		else
//		{
//			mm[no.first]=no.second;num++;
//		}
//	}
}
void dfsFindFile(string path,string name,regex r)//自己原来用dfs写（抄）的文件查找，还没改
{
//	cout<<path<<endl;
	long hFile=0;//设定文件句柄
	struct _finddata_t info;
	string str;
	if((hFile=_findfirst((path+"\\*").c_str(),&info)) != -1)
		//第一个参数为文件名，第二个参数为_finddata_t结构体指针。若查找成功，返回文件句柄，若失败，返回-1。
	{
		do
		{
			string tmp=info.name;
			if(tmp[0]=='$')continue;
			tmp=path+"\\"+info.name;
//			if(regex_search(tmp,r))
////			if(toLower(tmp).find(toLower(name)) != string::npos)
//			{
//				cout<<tmp<<endl;
//				continue;
//			}
			if(info.attrib & _A_SUBDIR)//_A_SUBDIR表示是文件夹
			{
				if(strcmp(info.name, ".") != 0 && strcmp(info.name, "..") != 0)
				{
					dfsFindFile(path+"\\"+info.name,name,r);
				}
			}
			else
			{
				if(regex_search(info.name,r))
				{
					cout<<tmp<<endl;
				}
//				cout<<path+"\\"+info.name<<endl;
			}
		}
		while(_findnext(hFile,&info) != -1);
		_findclose(hFile);
		//寻找下一个，成功返回0，否则-1
	}
}
void getDriver()//get all logical driver
{
	DWORD bufLen = GetLogicalDriveStrings(0,NULL);//复制缓冲区需要的字符串的长度
	char driverBuf[bufLen];//接收缓冲区内容的数组，用于存储系统盘符
	//最后得到的结果形如 'C' ':' '\' '\0' 'D' ':' '\' '\0' '\0'
	GetLogicalDriveStrings(bufLen,driverBuf);//获取整个系统盘符名字符串
	char* driverName = driverBuf;//方便从头开始遍历整个数组
	while(*driverName != '\0')//因为有跳过'\0',所以如果遇到'\0'就说明已经得到了所有的盘了
	{
		cout<<driverName<<endl;
		if(checkNTFS(driverName))//检查是否是NTFS文件系统盘
		{
			clock_t a,b;
			getHandle(driverName);//获取驱动盘句柄
			a=clock();
			build(driverName,"\\",TrueRoot);//建立文件树
			b=clock();
			cout<<b-a<<endl;
			cout<<driverName<<" "<<num<<endl;
//			for(auto i:ve) if(mm[i.frn] != "") cout<<mm[i.frn]<<" :  \n" ;
			ma.clear();
			mm.clear();
			ve.clear();
			num=0;
		}
		else
		{
			//dfsFindFile();
		}
		driverName += strlen(driverName)+1;// 让指针跳到下一个盘符名并跳过'\0'
	}
}
void connect()
{
	mysql_init(&mysql);
	if(!mysql_real_connect(&mysql,"localhost","root","passwd","test",3306,NULL,0)) cout<<"password wrong\n";
	else
	{
		cout<<"ok\n";
		sql="create database if not exists everything default charset utf8;";
		if(mysql_query(&mysql,sql.c_str()))
			printf("sql语句 %s 执行出现异常：%s\n",sql.c_str(),mysql_error(&mysql));
		mysql_query(&mysql,"use everything;");
		sql="create table if not exists myfile (path varchar(3000), name varchar(500));";
		if(mysql_query(&mysql,sql.c_str()))
			printf("sql语句 %s 执行出现异常：%s\n",sql.c_str(),mysql_error(&mysql));
		mysql_query(&mysql,"truncate table myfile;");//因为无法获取更新信息，只能用最傻的方法——每次都重新获取文件信息
		if(mysql_query(&mysql, "set names gbk"))//设置gbk编码，不然在数据库内中文字符会出现乱码
			printf("编码设置失败，%s\n",mysql_error(&mysql));
	}
}
void query()//查询，没写完，日后再实现
{
	sql="select * from myfile limit 100";
	if(!mysql_query(&mysql,sql.c_str()))
	{
		if(res=mysql_store_result(&mysql))
		{
			printf("返回数据行数:%d\n",mysql_affected_rows(&mysql));
			while(rows=mysql_fetch_row(res))
			{
				for(int t=0; t <mysql_num_fields(res); t++)
				{
					printf("%s:  ",rows[t]);
				}
				printf("\n");
			}
			mysql_free_result(res);
		}
	}
//	string name;
//	while(cin>>name)
//	{
//
//	}
}
int main()
{
	clock_t s,e;
	s=clock();//开始计时
	connect();
	getDriver();
//	query();
	mysql_close(&mysql);
	e=clock();//结束计时
	cout<<"总用时 : "<<e-s<<" ms.\n";
	getchar();//避免一闪而过
}
```

代码还没全部完成，不知道为什么，我没办法正确获得文件更新记录。由于时间关系，对于非NTFS文件系统的盘代码直接复制粘贴了以前自己dfs的代码，还没改。并且运行需要自己用管理员权限运行，我没有自己内嵌提权了

暂时就这样吧，因为又找到了番看，所以这个就先放着了哈哈。日后记得起来的话会更新完了。不过起码文件查找部分已经ok了。经过实验，找到所有文件（约60万个）并写入数据库只要不到两分钟，如果不写入数据库，正常来说20秒不到，其中dfs建树约为5秒（听说哈希表会比map好用些？）。运行的时间差不多都花在写数据库上了，原因不明，实在想不通别人那100万只要1分钟是怎么做到的。

做过一个比较，同样是遍历我电脑的C盘（约33万文件）找文件，自己原来的dfs费时约1个小时，windows文件管理器约半个小时，命令行dir /S约12分钟，自己现在的这个代码，2分钟不到。但我还是觉得用命令行最方便。